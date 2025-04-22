package main

import (
	"os"

	"server/routes"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func main() {
	port := os.Getenv("PORT")

	if port == "" {
		port = "8000"
	}

	router := gin.New()
	router.Use(gin.Logger())

	// Configure CORS to allow requests from your frontend app
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))
   
	router.POST("/api/auth/login", routes.Login)
    router.GET("/orders", routes.GetOrders)
	// Original endpoints
	router.POST("/order/create", routes.AddOrder)
	router.GET("/status/:status", routes.GetOrdersByStatus)

	router.PUT("/order/update/:id", routes.UpdateOrder)

	// New endpoints
	router.POST("/order/item/:id", routes.AddOrderItem)
	router.GET("/orders/table/:table", routes.GetOrdersByTable)
	router.GET("/orders/status/:status", routes.GetOrdersByStatus)
	router.PUT("/order/status/:id", routes.UpdateOrderStatus)
    router.GET("/menu-items", routes.GetAllMenuItems)
    router.Static("/uploads", "./public/uploads")

    router.POST("/menu-items", routes.AddMenuItem)
    router.POST("/menu-items/:id", routes.UpdateMenuItem)
    router.DELETE("/menu-items/:id", routes.DeleteMenuItem)
    router.GET("/menu-items/category/:category", routes.GetMenuItemsByCategory)


	router.POST("/api/reservation-info", routes.AddReservation)
	router.GET("/api/reservations", routes.GetReservations)
	router.GET("/api/reservations/:id", routes.GetReservation)
	router.PUT("/api/reservations/:id", routes.UpdateReservation)
	router.DELETE("/api/reservations/:id", routes.DeleteReservation)
	router.GET("/api/reservations/date/:date", routes.GetReservationsByDate)
	router.PATCH("/api/reservations/status/:id", routes.UpdateReservationStatus)

	// This runs the server and allows it to listen to requests
	router.Run(":" + port)
}