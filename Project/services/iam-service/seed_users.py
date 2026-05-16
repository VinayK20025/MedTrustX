import asyncio
import uuid
import re
from datetime import datetime, timezone
import sys
import os

# Set PYTHONPATH so we can import src
sys.path.append("/root/MedTrustX/Project/services/iam-service")

from src.database import AsyncSessionFactory, engine
from src.models.iam import User, Role, UserRole
from src.services.iam_service import get_password_hash
from sqlalchemy import select

ROLES = [
    "Board Member Hospital Owner Director",
    "Chief Executive Officer",
    "Chief Operating Officer",
    "Chief Medical Officer",
    "Chief Nursing Officer",
    "Chief Information Officer",
    "Chief Information Security Officer",
    "Chief Financial Officer",
    "Chief Compliance Officer",
    "Chief Technology Officer",
    "Chief Marketing Officer",
    "Medical Director",
    "Medical Superintendent Deputy",
    "Medical Superintendent",
    "Head of Department",
    "Clinical Director Unit Head",
    "General Physician",
    "Surgeon",
    "Anesthesiologist",
    "Cardiologist",
    "Neurologist",
    "Orthopedic Surgeon",
    "Dermatologist",
    "Gastroenterologist",
    "Endocrinologist",
    "Nephrologist",
    "Urologist",
    "Pulmonologist",
    "Oncologist",
    "Hematologist",
    "Rheumatologist",
    "Infectious Disease Specialist",
    "Pediatrician",
    "Neonatologist",
    "Gynecologist Obstetrician",
    "Psychiatrist",
    "Ophthalmologist",
    "ENT",
    "Specialist Emergency Critical Care",
    "Emergency Physician",
    "Intensivist Visiting External",
    "Consultant Locum Doctor",
    "Resident Doctor",
    "Junior Resident",
    "Senior Resident",
    "Medical Intern",
    "Medical Student Clinical Fellow",
    "Nursing Superintendent",
    "Deputy Nursing Superintendent",
    "Head Nurse Ward In-Charge",
    "Staff Nurse",
    "ICU Nurse",
    "ER Nurse",
    "OT Nurse",
    "Triage Nurse",
    "Infection Control Nurse",
    "Nursing Assistant",
    "Auxiliary Nurse Midwife",
    "Physiotherapist",
    "Occupational Therapist",
    "Speech Therapist",
    "Respiratory Therapist",
    "Dietitian Nutritionist",
    "Clinical Psychologist Counselor",
    "OT Manager Surgeon",
    "Assistant Scrub Nurse",
    "Circulating Nurse",
    "OT Technician",
    "Anesthesia Technician",
    "Laboratory Pathologist",
    "Microbiologist",
    "Biochemist Lab",
    "Technician Lab",
    "Assistant Phlebotomist",
    "Imaging Radiologist",
    "Radiology Technician",
    "MRI Technician",
    "CT Scan Technician",
    "Ultrasound Technician",
    "Chief Pharmacist",
    "Clinical Pharmacist",
    "Pharmacist",
    "Pharmacy Technician",
    "Pharmacy Assistant",
    "Care Coordinator",
    "Case Manager",
    "Patient Counselor",
    "Medical Social Worker",
    "Patient Relationship Manager",
    "Medical Records Officer",
    "Health Information Manager",
    "Medical Coder",
    "Medical Transcriptionist",
    "Hospital Administrator",
    "Front Desk Executive Receptionist",
    "Admission Officer Appointment Scheduler",
    "Discharge Coordinator",
    "HR Manager",
    "HR Executive",
    "Training Coordinator",
    "Billing Executive",
    "Accounts Manager",
    "Accountant",
    "Insurance Coordinator",
    "TPA Coordinator",
    "Claims Processing Officer",
    "Operations Manager",
    "Facility Manager",
    "Maintenance Engineer",
    "Electrician",
    "Plumber",
    "HVAC Technician",
    "Biomedical Engineer",
    "Biomedical Technician",
    "Medical Equipment Technician",
    "IT Administrator",
    "System Administrator",
    "Network Administrator",
    "Helpdesk Support",
    "Application Support Engineer",
    "EHR System Operator",
    "Security Manager Physical",
    "Security Guard",
    "Surveillance Operator CCTV",
    "Fire Safety Officer",
    "Disaster Management Officer",
    "Emergency Coordinator",
    "Infection Control Officer",
    "Quality Manager",
    "Quality Analyst",
    "Accreditation Coordinator",
    "Legal Advisor",
    "Ethics Committee Member",
    "Legal Compliance Officer",
    "Legal Risk Manager",
    "Procurement Manager",
    "Procurement Officer",
    "Inventory Manager",
    "Storekeeper Medical Store",
    "Storekeeper Non-Medical Store",
    "Supply Chain Coordinator",
    "Staff Ward",
    "Assistant Transport Staff",
    "Ambulance Driver",
    "Ambulance Paramedic",
    "Housekeeping Staff",
    "Laundry Staff",
    "Kitchen Staff Diet Kitchen Worker",
    "Paramedic Emergency Medical Technician",
    "Ambulance Coordinator",
    "Clinical Researcher Principal Investigator",
    "Trial Coordinator",
    "Research Nurse",
    "Data Manager Clinical Trials",
    "Telemedicine Doctor",
    "Remote Consultant",
    "Telehealth Coordinator",
    "External Auditor",
    "Regulatory Inspector",
    "Insurance Representative",
    "Third-Party Vendor Staff",
    "Organ Transplant Coordinator",
    "Mortuary Staff",
    "Forensic Specialist",
    "Blood Bank Officer",
    "Blood Bank Technician",
    "Pain Management Specialist",
    "Palliative Care Specialist",
    "Genetic Counselor",
    "Information Security Compliance Officer",
    "Information Security Risk Manager",
    "Data Protection Officer",
    "Internal Auditor",
    "DevOps Engineer",
    "DevSecOps Engineer",
    "Software Developer",
    "QA Test Engineer",
    "Integration Engineer",
    "API Gateway Manager",
    "Platform Engineer",
    "Network Engineer",
    "Data Engineer",
    "Data Analyst",
    "AI ML Engineer",
    "AI Governance Officer",
    "Clinical Informaticist",
    "Health Data Scientist",
    "AI Ethics Specialist",
    "Site Reliability Engineer",
    "IT Operations Manager",
    "IoMT Device",
    "Service Accounts",
    "Automation Bots",
    "Super Administrator",
    "IAM Administrator",
    "Access Reviewer Approver",
    "Privileged Access Manager",
    "Security Analyst SOC Analyst",
    "Security Engineer",
    "Incident Responder",
    "Threat Intelligence Analyst"
]

def format_role_for_username(role_name):
    # e.g., "Board Member Hospital Owner Director" -> "board-member-hospital-owner-director"
    s = role_name.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def format_role_for_password(role_name):
    # e.g., "Board Member" -> "Board_Member"
    return role_name.replace(' ', '_')

from src.database import AsyncSessionFactory, engine, init_db

async def main():
    print("Starting DB seeding...")
    await init_db()
    tenant_id = uuid.uuid5(uuid.NAMESPACE_DNS, "tenant_apollo")
    
    async with AsyncSessionFactory() as session:
        for role_name in ROLES:
            uname_part = format_role_for_username(role_name)
            pwd_part = format_role_for_password(role_name)
            
            username = f"demo@{uname_part}.local.medtrustx"
            email = f"demo@{uname_part}.local.medtrustx"
            password = f"{pwd_part}@1Demo"
            hashed_password = get_password_hash(password)
            
            # Create Role
            # Check if role exists
            res = await session.execute(select(Role).where(Role.name == role_name))
            role_obj = res.scalar_one_or_none()
            if not role_obj:
                role_obj = Role(
                    tenant_id=tenant_id,
                    name=role_name,
                    description=f"Auto-generated role for {role_name}"
                )
                session.add(role_obj)
                await session.flush()
                
            # Create User
            res = await session.execute(select(User).where(User.username == username))
            user_obj = res.scalar_one_or_none()
            if not user_obj:
                user_obj = User(
                    tenant_id=tenant_id,
                    username=username,
                    email=email,
                    password_hash=hashed_password,
                    status="active"
                )
                session.add(user_obj)
                await session.flush()
                
            # Assign Role to User
            res = await session.execute(select(UserRole).where(UserRole.user_id == user_obj.id).where(UserRole.role_id == role_obj.id))
            user_role = res.scalar_one_or_none()
            if not user_role:
                user_role = UserRole(
                    tenant_id=tenant_id,
                    user_id=user_obj.id,
                    role_id=role_obj.id
                )
                session.add(user_role)
                
        # Presentation Demo Users
        DEMO_USERS = [
            {"username": "dr.smith", "role": "Head of Department", "password": "medtrust2026"},
            {"username": "nurse.joy", "role": "Staff Nurse", "password": "medtrust2026"},
            {"username": "icu.dr.jones", "role": "Specialist Emergency Critical Care", "password": "medtrust2026"},
            {"username": "admin", "role": "Super Administrator", "password": "keycloak_admin_2026"},
        ]
        
        for du in DEMO_USERS:
            res = await session.execute(select(Role).where(Role.name == du["role"]))
            r_obj = res.scalar_one_or_none()
            if r_obj:
                u_res = await session.execute(select(User).where(User.username == du["username"]))
                u_obj = u_res.scalar_one_or_none()
                if not u_obj:
                    u_obj = User(
                        tenant_id=tenant_id,
                        username=du["username"],
                        email=f"{du['username']}@medtrustx.in",
                        password_hash=get_password_hash(du["password"]),
                        status="active"
                    )
                    session.add(u_obj)
                    await session.flush()
                
                ur_res = await session.execute(select(UserRole).where(UserRole.user_id == u_obj.id).where(UserRole.role_id == r_obj.id))
                ur_obj = ur_res.scalar_one_or_none()
                if not ur_obj:
                    ur_obj = UserRole(tenant_id=tenant_id, user_id=u_obj.id, role_id=r_obj.id)
                    session.add(ur_obj)
        
        await session.commit()
        print("Successfully seeded all users and roles.")

if __name__ == "__main__":
    asyncio.run(main())
