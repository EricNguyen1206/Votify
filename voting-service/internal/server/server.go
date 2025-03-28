package server

import (
	"log"
	"time"

	"github.com/IBM/sarama"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"voting-service/internal/adapters/database"
	"voting-service/internal/server/handlers"
	"voting-service/internal/server/middleware"
	"voting-service/internal/server/repository"
	"voting-service/internal/server/service"
)

// Server represents the HTTP server
type Server struct {
	router *gin.Engine
	db     *gorm.DB
}

// NewServer creates a new HTTP server
func NewServer(db *gorm.DB, minioClient *database.MinIOClient, kafkaProducer sarama.SyncProducer) *Server {
	router := gin.Default()

	// Initialize middleware
	router.Use(middleware.CORS())

	// Add graceful shutdown for Kafka producer
	go func() {
		<-time.After(5 * time.Second) // Wait for 5 seconds before closing
		if err := kafkaProducer.Close(); err != nil {
			log.Printf("Error closing Kafka producer: %v", err)
		}
	}()

	// Initialize repositories
	authRepo := repository.NewAuthRepository(db)

	// Initialize services
	authService := service.NewAuthService(
		authRepo,
		"your-secret-key", // Replace with your JWT secret
		time.Hour,         // Token expiration time
	)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)

	// Initialize repositories
	topicRepo := repository.NewTopicRepository(db)
	optionRepo := repository.NewOptionRepository(db)
	voteRepo := repository.NewVoteRepository(db)

	// Initialize services
	topicService := service.NewTopicService(topicRepo, minioClient)
	optionService := service.NewOptionService(optionRepo)
	voteService := service.NewVoteService(voteRepo)

	// Initialize handlers
	topicHandler := handlers.NewTopicHandler(topicService)
	optionHandler := handlers.NewOptionHandler(optionService)
	voteHandler := handlers.NewVoteHandler(voteService, kafkaProducer)

	// Setup routes
	SetupRoutes(router, authHandler, topicHandler, optionHandler, voteHandler)

	return &Server{
		router: router,
		db:     db,
	}
}

// Start runs the HTTP server
func (s *Server) Start(address string) error {
	log.Printf("Server is running on %s\n", address)
	return s.router.Run(address)
}
