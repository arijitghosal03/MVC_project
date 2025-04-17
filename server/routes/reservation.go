package routes

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"server/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var reservationCollection *mongo.Collection = OpenCollection(Client, "reservations")

// AddReservation creates a new reservation in the database
func AddReservation(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	var reservation models.Reservation

	if err := c.BindJSON(&reservation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		fmt.Println(err)
		return
	}

	validationErr := validate.Struct(reservation)
	if validationErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
		fmt.Println(validationErr)
		return
	}

	// Set default values and generate ID
	reservation.ID = primitive.NewObjectID()
	reservation.CreatedAt = primitive.NewDateTimeFromTime(time.Now())
	
	// Set default status if not provided
	defaultStatus := "Pending"
	if reservation.Status == nil {
		reservation.Status = &defaultStatus
	}

	result, insertErr := reservationCollection.InsertOne(ctx, reservation)
	if insertErr != nil {
		msg := fmt.Sprintf("reservation was not created")
		c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
		fmt.Println(insertErr)
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetReservations retrieves all reservations
func GetReservations(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()
	
	var reservations []bson.M

	cursor, err := reservationCollection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println(err)
		return
	}

	if err = cursor.All(ctx, &reservations); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println(err)
		return
	}

	c.JSON(http.StatusOK, reservations)
}

// GetReservation retrieves a specific reservation by ID
func GetReservation(c *gin.Context) {
	reservationID := c.Params.ByName("id")
	docID, _ := primitive.ObjectIDFromHex(reservationID)

	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	var reservation bson.M
	if err := reservationCollection.FindOne(ctx, bson.M{"_id": docID}).Decode(&reservation); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println(err)
		return
	}

	c.JSON(http.StatusOK, reservation)
}

// UpdateReservation updates an existing reservation
func UpdateReservation(c *gin.Context) {
	reservationID := c.Params.ByName("id")
	docID, _ := primitive.ObjectIDFromHex(reservationID)

	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	var reservation models.Reservation

	if err := c.BindJSON(&reservation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		fmt.Println(err)
		return
	}

	validationErr := validate.Struct(reservation)
	if validationErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
		fmt.Println(validationErr)
		return
	}

	// Create update document
	updateDoc := bson.M{
		"name":           reservation.Name,
		"date":           reservation.Date,
		"time":           reservation.Time,
		"guests":         reservation.Guests,
		"phone":          reservation.Phone,
		"email":          reservation.Email,
		"specialrequests": reservation.SpecialRequests,
		"status":         reservation.Status,
	}

	result, err := reservationCollection.UpdateOne(
		ctx,
		bson.M{"_id": docID},
		bson.D{{"$set", updateDoc}},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println(err)
		return
	}

	c.JSON(http.StatusOK, result.ModifiedCount)
}

// DeleteReservation removes a reservation from the database
func DeleteReservation(c *gin.Context) {
	reservationID := c.Params.ByName("id")
	docID, _ := primitive.ObjectIDFromHex(reservationID)

	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	result, err := reservationCollection.DeleteOne(ctx, bson.M{"_id": docID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println(err)
		return
	}

	c.JSON(http.StatusOK, result.DeletedCount)
}

// GetReservationsByDate retrieves reservations for a specific date
func GetReservationsByDate(c *gin.Context) {
	date := c.Params.ByName("date")
	
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()
	
	var reservations []bson.M

	cursor, err := reservationCollection.Find(ctx, bson.M{"date": date})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println(err)
		return
	}

	if err = cursor.All(ctx, &reservations); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println(err)
		return
	}

	c.JSON(http.StatusOK, reservations)
}

// UpdateReservationStatus updates the status of a reservation
func UpdateReservationStatus(c *gin.Context) {
	reservationID := c.Params.ByName("id")
	docID, _ := primitive.ObjectIDFromHex(reservationID)

	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	type ReservationStatus struct {
		Status *string `json:"status"`
	}

	var status ReservationStatus

	if err := c.BindJSON(&status); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		fmt.Println(err)
		return
	}

	result, err := reservationCollection.UpdateOne(
		ctx,
		bson.M{"_id": docID},
		bson.D{{"$set", bson.D{{"status", status.Status}}}},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println(err)
		return
	}

	c.JSON(http.StatusOK, result.ModifiedCount)
}