package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/work-near-me/backend/internal/usecase"
)

type ApplicationHandler struct {
	appUC *usecase.ApplicationUseCase
}

func NewApplicationHandler(appUC *usecase.ApplicationUseCase) *ApplicationHandler {
	return &ApplicationHandler{appUC: appUC}
}

func (h *ApplicationHandler) Apply(c *gin.Context) {
	jobID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid job id"})
		return
	}

	workerID := c.MustGet("user_id").(uuid.UUID)

	app, err := h.appUC.Apply(jobID, workerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, app)
}

func (h *ApplicationHandler) Accept(c *gin.Context) {
	appID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid application id"})
		return
	}

	employerID := c.MustGet("user_id").(uuid.UUID)

	app, err := h.appUC.Accept(appID, employerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, app)
}

func (h *ApplicationHandler) Reject(c *gin.Context) {
	appID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid application id"})
		return
	}

	employerID := c.MustGet("user_id").(uuid.UUID)

	app, err := h.appUC.Reject(appID, employerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, app)
}

func (h *ApplicationHandler) GetByJobID(c *gin.Context) {
	jobID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid job id"})
		return
	}

	apps, err := h.appUC.GetByJobID(jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"applications": apps})
}
