"""MedTrustX Medical Education Service — Models."""
from src.models.base import BaseModel
from src.models.education import Course, Enrollment, Lesson, Assessment, Certification

__all__ = ["BaseModel", "Course", "Enrollment", "Lesson", "Assessment", "Certification"]
