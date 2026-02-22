package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Rating struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	JobID      uuid.UUID `gorm:"type:uuid;not null;index" json:"job_id"`
	Job        *Job      `gorm:"foreignKey:JobID" json:"job,omitempty"`
	FromUserID uuid.UUID `gorm:"type:uuid;not null;index" json:"from_user_id"`
	FromUser   *User     `gorm:"foreignKey:FromUserID" json:"from_user,omitempty"`
	ToUserID   uuid.UUID `gorm:"type:uuid;not null;index" json:"to_user_id"`
	ToUser     *User     `gorm:"foreignKey:ToUserID" json:"to_user,omitempty"`
	Score      int       `gorm:"not null;check:score >= 1 AND score <= 5" json:"score"`
	Comment    string    `gorm:"type:text" json:"comment"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (r *Rating) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}
