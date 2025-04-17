package routes

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"net/http"
	"time"
    "encoding/json"
	"strconv"
	"server/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var menuItemCollection *mongo.Collection = OpenCollection(Client, "menuitems")

// AddMenuItem handles the creation of a new menu item
func AddMenuItem(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	// Parse form data
	name := c.PostForm("name")
	description := c.PostForm("description")
	priceStr := c.PostForm("price")
	category := c.PostForm("category")
	ratingStr := c.PostForm("rating")
	specialsStr := c.PostForm("specials") // JSON string

	price, _ := strconv.ParseFloat(priceStr, 64)
	rating, _ := strconv.ParseFloat(ratingStr, 64)

	var specials []string
	_ = json.Unmarshal([]byte(specialsStr), &specials)

	// Handle file (optional)
	file, err := c.FormFile("image")
	var imagePath string
	if err == nil {
		// Define path to frontend public uploads directory
		uploadsDir := "../frontend/public/uploads"
		
		// Create uploads directory if it doesn't exist
		if _, statErr := os.Stat(uploadsDir); os.IsNotExist(statErr) {
			if mkdirErr := os.MkdirAll(uploadsDir, 0755); mkdirErr != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create uploads directory"})
				return
			}
		}
		
		// Generate unique filename to prevent overwriting
		filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
		imagePath =  filename  // This is what gets stored in the database
		fullPath := filepath.Join(uploadsDir, filename)
		
		// Save the file
		if saveErr := c.SaveUploadedFile(file, fullPath); saveErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image: " + saveErr.Error()})
			return
		}
	}

	menuItem := models.MenuItem{
		ID:          primitive.NewObjectID(),
		Name:        name,
		Description: description,
		Price:       price,
		Category:    category,
		Rating:      rating,
		Specials:    specials,
		Image:       imagePath,
		CreatedAt:   primitive.NewDateTimeFromTime(time.Now()),
	}
	
	result, insertErr := menuItemCollection.InsertOne(ctx, menuItem)
	if insertErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Menu item was not created"})
		return
	}

	c.JSON(http.StatusOK, result)
}


// GetMenuItem retrieves a specific menu item by ID
func GetMenuItem(c *gin.Context) {
	itemID := c.Params.ByName("id")
	docID, err := primitive.ObjectIDFromHex(itemID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID format"})
		return
	}

	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	var menuItem models.MenuItem
	err = menuItemCollection.FindOne(ctx, bson.M{"_id": docID}).Decode(&menuItem)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "menu item not found"})
		return
	}

	c.JSON(http.StatusOK, menuItem)
}

// UpdateMenuItem handles updating an existing menu item
func UpdateMenuItem(c *gin.Context) {
	itemID := c.Param("id")
	docID, err := primitive.ObjectIDFromHex(itemID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID format"})
		return
	}

	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	var menuItem models.MenuItem

	if err := c.BindJSON(&menuItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		fmt.Println(err)
		return
	}

	validationErr := validate.Struct(menuItem)
	if validationErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
		fmt.Println(validationErr)
		return
	}

	// Create update document
	updateDoc := bson.M{
		"name":        menuItem.Name,
		"description": menuItem.Description,
		"price":       menuItem.Price,
		"category":    menuItem.Category,
		"image":       menuItem.Image,
		"rating":      menuItem.Rating,
		"specials":    menuItem.Specials,
		"updatedAt":   primitive.NewDateTimeFromTime(time.Now()),
	}

	result, err := menuItemCollection.UpdateOne(
		ctx,
		bson.M{"_id": docID},
		bson.M{"$set": updateDoc},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println(err)
		return
	}

	// Return the updated document if modified
	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "menu item not found"})
		return
	}

	var updatedMenuItem models.MenuItem
	err = menuItemCollection.FindOne(ctx, bson.M{"_id": docID}).Decode(&updatedMenuItem)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated item"})
		return
	}

	c.JSON(http.StatusOK, updatedMenuItem)
}

// DeleteMenuItem handles deleting a menu item
func DeleteMenuItem(c *gin.Context) {
	itemID := c.Params.ByName("id")
	docID, err := primitive.ObjectIDFromHex(itemID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID format"})
		return
	}

	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	result, err := menuItemCollection.DeleteOne(ctx, bson.M{"_id": docID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.DeletedCount < 1 {
		c.JSON(http.StatusNotFound, gin.H{"error": "menu item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "menu item successfully deleted"})
}

// GetAllMenuItems retrieves all menu items with optional filtering
func GetAllMenuItems(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	// Get query parameters for filtering
	category := c.Query("category")
	availableOnly := c.Query("available") == "true"

	// Build filter
	filter := bson.M{}
	if category != "" {
		filter["category"] = category
	}
	if availableOnly {
		filter["isavailable"] = true
	}

	// Set up options for sorting
	findOptions := options.Find()
	findOptions.SetSort(bson.M{"name": 1}) // Sort by name ascending

	cursor, err := menuItemCollection.Find(ctx, filter, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var menuItems []models.MenuItem
	if err = cursor.All(ctx, &menuItems); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, menuItems)
}

// GetMenuItemsByCategory retrieves menu items filtered by category
func GetMenuItemsByCategory(c *gin.Context) {
	category := c.Params.ByName("category")
	
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	filter := bson.M{"category": category}
	
	// Only show available items by default
	if c.Query("showall") != "true" {
		filter["isavailable"] = true
	}

	cursor, err := menuItemCollection.Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var menuItems []models.MenuItem
	if err = cursor.All(ctx, &menuItems); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, menuItems)
}