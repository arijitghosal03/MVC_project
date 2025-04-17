package routes

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"server/models"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/bson"
	"github.com/gin-gonic/gin"
)

var validate = validator.New()

var orderCollection *mongo.Collection = OpenCollection(Client, "orders")

func AddOrder(c *gin.Context) {
    var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
    defer cancel()

    var order models.Order

    if err := c.BindJSON(&order); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    validationErr := validate.Struct(order)
    if validationErr != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
        fmt.Println(validationErr)
        return
    }

    // Set default values and generate ID
    order.ID = primitive.NewObjectID()
    order.CreatedAt = primitive.NewDateTimeFromTime(time.Now())
    
    // Set default status if not provided
    defaultStatus := "New"
    if order.Status == nil {
        order.Status = &defaultStatus
    }
    
    // Calculate total price from items

    result, insertErr := orderCollection.InsertOne(ctx, order)
    if insertErr != nil {
        msg := fmt.Sprintf("order was not created")
        c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
        fmt.Println(insertErr)
        return
    }

    c.JSON(http.StatusOK, result)
}

// Similarly update UpdateOrder to handle the new model
func UpdateOrder(c *gin.Context) {
    orderID := c.Params.ByName("id")
    docID, _ := primitive.ObjectIDFromHex(orderID)

    var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
    defer cancel()

    var order models.Order

    if err := c.BindJSON(&order); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    validationErr := validate.Struct(order)
    if validationErr != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
        fmt.Println(validationErr)
        return
    }

    // Recalculate total price 
    var totalPrice float64 = 0
    if order.Items != nil {
        for _, item := range order.Items {
            if item.Price != nil && item.Quantity != nil {
                totalPrice += *item.Price * float64(*item.Quantity)
            }
        }
    }
    
    // Create update document
    updateDoc := bson.M{
        "items":           order.Items,
        "server":          order.Server,
        "table":           order.Table,
        "customername":    order.CustomerName,
        "specialrequests": order.SpecialRequests,
        "status":          order.Status,
        "totalprice":      totalPrice,
    }

    result, err := orderCollection.ReplaceOne(ctx, bson.M{"_id": docID}, updateDoc)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    c.JSON(http.StatusOK, result.ModifiedCount)
}

// Add these new functions to connection.go

// GetOrdersByStatus retrieves orders filtered by status
func GetOrdersByStatus(c *gin.Context) {
    status := c.Params.ByName("status")
    
    var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
    defer cancel()
    
    var orders []bson.M

    cursor, err := orderCollection.Find(ctx, bson.M{"status": status})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    if err = cursor.All(ctx, &orders); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    c.JSON(http.StatusOK, orders)
}
func GetOrders(c *gin.Context) {
    var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
    defer cancel()
    
    var orders []bson.M

    cursor, err := orderCollection.Find(ctx, bson.M{})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    if err = cursor.All(ctx, &orders); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    c.JSON(http.StatusOK, orders)
}
// GetOrdersByTable retrieves orders for a specific table
func GetOrdersByTable(c *gin.Context) {
    table := c.Params.ByName("table")
    
    var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
    defer cancel()
    
    var orders []bson.M

    cursor, err := orderCollection.Find(ctx, bson.M{"table": table})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    if err = cursor.All(ctx, &orders); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    c.JSON(http.StatusOK, orders)
}

// UpdateOrderStatus updates the status of an order
func UpdateOrderStatus(c *gin.Context) {
    orderID := c.Params.ByName("id")
    docID, _ := primitive.ObjectIDFromHex(orderID)

    var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
    defer cancel()

    type OrderStatus struct {
        Status *string `json:"status"`
    }

    var status OrderStatus

    if err := c.BindJSON(&status); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    result, err := orderCollection.UpdateOne(ctx, bson.M{"_id": docID}, 
        bson.D{
            {"$set", bson.D{{"status", status.Status}}},
        },
    )

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    c.JSON(http.StatusOK, result.ModifiedCount)
}

// AddOrderItem adds a new item to an existing order
func AddOrderItem(c *gin.Context) {
    orderID := c.Params.ByName("id")
    docID, _ := primitive.ObjectIDFromHex(orderID)

    var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
    defer cancel()

    var newItem models.OrderItem

    if err := c.BindJSON(&newItem); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    // First get the current order to calculate the new total price
    var currentOrder models.Order
    if err := orderCollection.FindOne(ctx, bson.M{"_id": docID}).Decode(&currentOrder); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    // Calculate new total price
    newTotal := *currentOrder.TotalPrice
    if newItem.Price != nil && newItem.Quantity != nil {
        newTotal += *newItem.Price * float64(*newItem.Quantity)
    }

    // Update the order with the new item and total
    result, err := orderCollection.UpdateOne(
        ctx,
        bson.M{"_id": docID},
        bson.D{
            {"$push", bson.D{{"items", newItem}}},
            {"$set", bson.D{{"totalprice", newTotal}}},
        },
    )

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        fmt.Println(err)
        return
    }

    c.JSON(http.StatusOK, result.ModifiedCount)
}