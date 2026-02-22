package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ApplicationStatus string

const (
	ApplicationStatusPending  ApplicationStatus = "pending"
	ApplicationStatusAccepted ApplicationStatus = "accepted"
	ApplicationStatusRejected ApplicationStatus = "rejected"
)

type Application struct {
	ID        uuid.UUID         `gorm:"type:uuid;primaryKey" json:"id"`
	JobID     uuid.UUID         `gorm:"type:uuid;not null;index" json:"job_id"`
	Job       *Job              `gorm:"foreignKey:JobID" json:"job,omitempty"`
	WorkerID  uuid.UUID         `gorm:"type:uuid;not null;index" json:"worker_id"`
	Worker    *User             `gorm:"foreignKey:WorkerID" json:"worker,omitempty"`
	Status    ApplicationStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	CreatedAt time.Time         `gorm:"autoCreateTime" json:"created_at"`
}

func (a *Application) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
