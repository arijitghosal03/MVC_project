package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderItem struct {
	Dish     *string   `json:"item" bson:"items"`
	Price    *float64  `json:"price" bson:"price"`
	Quantity *int      `json:"quantity" bson:"quantity"`
}

type Order struct {
	ID              primitive.ObjectID  `bson:"_id"`
	Items           []OrderItem         `json:"items"`
	Server          *string             `json:"server"`
	Table           *string             `json:"table"`
	CustomerName    *string             `json:"customerName"`
	SpecialRequests *string             `json:"specialRequests,omitempty"`
	Status          *string             `json:"status"`
	TotalPrice      *float64            `json:"totalPrice"`
	CreatedAt       primitive.DateTime  `json:"createdAt"`
}
type MenuItem struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `json:"name" binding:"required"`
	Description string             `json:"description" binding:"required"`
	Price       float64            `json:"price" binding:"required"`
	Category    string             `json:"category" binding:"required"`
	Image       string             `json:"image,omitempty"`
	Rating      float64            `json:"rating" default:"4.0"`
	Specials    []string           `json:"specials,omitempty"`
	CreatedAt   primitive.DateTime `json:"createdAt,omitempty"`
	UpdatedAt   primitive.DateTime `json:"updatedAt,omitempty"`
}
type Reservation struct {
	ID              primitive.ObjectID  `bson:"_id"`
	Name            *string             `json:"name" validate:"required" bson:"name"`
	Date            *string             `json:"date" validate:"required" bson:"date"`
	Time            *string             `json:"time" validate:"required" bson:"time"`
	Guests          *string             `json:"guests" validate:"required" bson:"guests"`
	Phone           *string             `json:"phone" validate:"required" bson:"phone"`
	Email           *string             `json:"email" validate:"required,email" bson:"email"`
	SpecialRequests *string             `json:"specialRequests,omitempty" bson:"specialrequests"`
	Status          *string             `json:"status" bson:"status"`
	CreatedAt       primitive.DateTime  `json:"createdAt" bson:"createdat"`
}