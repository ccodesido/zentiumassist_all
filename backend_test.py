#!/usr/bin/env python3
"""
Zentium Assist Backend API Testing Suite
Tests all endpoints for the mental health platform
"""

import requests
import sys
import json
from datetime import datetime
import uuid

class ZentiumAPITester:
    def __init__(self, base_url="https://29d5ee5e-06ed-4e16-bd1a-5f58ec0324b4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.professional_id = None
        self.patient_id = None
        self.tests_run = 0
        self.tests_passed = 0
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
        
    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
            
        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
                
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.log(f"Response: {response.text}", "ERROR")
                return False, {}
                
        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}", "FAIL")
            return False, {}
    
    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET", 
            "health",
            200
        )
        return success
    
    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_professional_{uuid.uuid4().hex[:8]}@zentium.com"
        test_data = {
            "email": test_email,
            "name": "Dr. Test Professional",
            "password": "TestPass123!",
            "role": "professional"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register", 
            200,
            data=test_data
        )
        
        if success:
            self.user_data = response
            self.log(f"Registered user: {response.get('email')}")
        
        return success
    
    def test_user_login(self):
        """Test user login"""
        if not self.user_data:
            self.log("No user data available for login test", "ERROR")
            return False
            
        login_data = {
            "email": self.user_data["email"],
            "password": "TestPass123!"  # We know this from registration
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success:
            self.token = response.get("token")
            if response.get("profile"):
                self.professional_id = response["profile"]["id"]
            self.log(f"Login successful, token: {self.token[:20]}...")
        
        return success
    
    def test_professional_dashboard(self):
        """Test professional dashboard"""
        if not self.professional_id:
            self.log("No professional ID available", "ERROR")
            return False
            
        success, response = self.run_test(
            "Professional Dashboard",
            "GET",
            f"professionals/{self.professional_id}/dashboard",
            200
        )
        
        if success:
            self.log(f"Dashboard loaded - Patients: {response.get('patients_count', 0)}")
        
        return success
    
    def test_create_patient(self):
        """Test patient creation"""
        if not self.professional_id:
            self.log("No professional ID available", "ERROR")
            return False
            
        patient_data = {
            "age": 28,
            "gender": "femenino",
            "emergency_contact": "Maria Rodriguez - 555-0123",
            "professional_id": self.professional_id
        }
        
        success, response = self.run_test(
            "Create Patient",
            "POST",
            f"professionals/{self.professional_id}/patients",
            200,
            data=patient_data
        )
        
        if success:
            self.patient_id = response.get("id")
            self.log(f"Patient created with ID: {self.patient_id}")
        
        return success
    
    def test_chat_message(self):
        """Test AI chat functionality"""
        if not self.patient_id:
            self.log("No patient ID available", "ERROR")
            return False
            
        # Test normal message
        message_data = {"message": "Hola, me siento un poco ansioso hoy"}
        
        success, response = self.run_test(
            "Send Chat Message",
            "POST",
            f"chat/{self.patient_id}/message",
            200,
            data=message_data
        )
        
        if success:
            self.log(f"AI Response received: {response.get('ai_response', {}).get('message', '')[:50]}...")
        
        return success
    
    def test_crisis_detection(self):
        """Test crisis detection in chat"""
        if not self.patient_id:
            self.log("No patient ID available", "ERROR")
            return False
            
        # Test crisis message
        crisis_message = {"message": "Me siento muy mal, no puedo más, estoy pensando en hacerme daño"}
        
        success, response = self.run_test(
            "Crisis Detection Test",
            "POST",
            f"chat/{self.patient_id}/message",
            200,
            data=crisis_message
        )
        
        if success:
            is_crisis = response.get("is_crisis", False)
            self.log(f"Crisis detected: {is_crisis}")
            if is_crisis:
                self.log("✅ Crisis detection working correctly")
            else:
                self.log("⚠️ Crisis detection may not be working")
        
        return success
    
    def test_create_task(self):
        """Test task creation"""
        if not self.patient_id:
            self.log("No patient ID available", "ERROR")
            return False
            
        task_data = {
            "patient_id": self.patient_id,
            "title": "Ejercicio de respiración",
            "description": "Practica respiración profunda por 10 minutos diarios",
            "task_type": "exercise"
        }
        
        success, response = self.run_test(
            "Create Task",
            "POST",
            "tasks",
            200,
            data=task_data
        )
        
        if success:
            task_id = response.get("id")
            self.log(f"Task created with ID: {task_id}")
            
            # Test task completion
            complete_success, _ = self.run_test(
                "Complete Task",
                "PUT",
                f"tasks/{task_id}/complete",
                200,
                data={"completion_notes": "Completado durante prueba"}
            )
            
            return complete_success
        
        return success
    
    def test_analytics_dashboard(self):
        """Test analytics dashboard"""
        success, response = self.run_test(
            "Analytics Dashboard",
            "GET",
            "analytics/dashboard",
            200
        )
        
        if success:
            self.log(f"Analytics - Users: {response.get('total_users')}, Patients: {response.get('total_patients')}")
        
        return success
    
    def test_chat_history(self):
        """Test chat history retrieval"""
        if not self.patient_id:
            self.log("No patient ID available", "ERROR")
            return False
            
        success, response = self.run_test(
            "Chat History",
            "GET",
            f"chat/{self.patient_id}/history",
            200
        )
        
        if success:
            message_count = len(response) if isinstance(response, list) else 0
            self.log(f"Chat history loaded - {message_count} messages")
        
        return success
    
    def run_all_tests(self):
        """Run all API tests"""
        self.log("🚀 Starting Zentium Assist API Tests")
        self.log(f"Testing against: {self.base_url}")
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Professional Dashboard", self.test_professional_dashboard),
            ("Create Patient", self.test_create_patient),
            ("Chat Message", self.test_chat_message),
            ("Crisis Detection", self.test_crisis_detection),
            ("Create & Complete Task", self.test_create_task),
            ("Chat History", self.test_chat_history),
            ("Analytics Dashboard", self.test_analytics_dashboard),
        ]
        
        self.log("=" * 60)
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.log(f"❌ {test_name} failed with exception: {str(e)}", "ERROR")
            
            self.log("-" * 40)
        
        # Final results
        self.log("=" * 60)
        self.log(f"📊 TEST RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            self.log("🎉 ALL TESTS PASSED!", "SUCCESS")
            return 0
        else:
            self.log(f"⚠️ {self.tests_run - self.tests_passed} tests failed", "WARNING")
            return 1

def main():
    """Main test runner"""
    tester = ZentiumAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())