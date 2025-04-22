package routes

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"` // Hashed password
	Role     string `json:"role"`     // "admin" or "staff"
}

// CreateHashedPassword is a utility function to generate bcrypt hashes
// You can use this once to generate hashes for your test users
func CreateHashedPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(bytes), err
}

// Initialize users with correctly hashed passwords
// This ensures the password hashes are correct for "admin123" and "staff123"
func initUsers() []User {
	adminHash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), 10)
	staffHash, _ := bcrypt.GenerateFromPassword([]byte("staff123"), 10)
	
	return []User{
		{
			ID:       "1",
			Username: "admin",
			Password: string(adminHash),
		
		},
		{
			ID:       "2",
			Username: "staff",
			Password: string(staffHash),
			
		},
	}
}

// In a real application, users would be stored in a database
// This is just a simple example
var users = initUsers()

// FindUserByUsername finds a user by username
func FindUserByUsername(username string) *User {
	for _, u := range users {
		if u.Username == username {
			return &u
		}
	}
	return nil
}

// Login handles user authentication and issues JWT tokens
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user
	user := FindUserByUsername(req.Username)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("Invalid credentials: %v", err)})
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  user.ID,
		"name": user.Username,
		"exp":  time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours
	})

	// Sign the token with our secret
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-default-secret-key" // Fallback for development
	}
	
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Return the token
	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			
		},
	})
}

// GetCurrentUser returns the current authenticated user
func GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	// In a real app, you would look up the user from the database
	// using the ID from the token
	var currentUser *User
	for _, u := range users {
		if u.ID == userID.(string) {
			currentUser = &u
			break
		}
	}

	if currentUser == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":       currentUser.ID,
		"username": currentUser.Username,
		"role":     currentUser.Role,
	})
}