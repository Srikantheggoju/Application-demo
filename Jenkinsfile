pipeline {
    agent any

    environment {
        FRONTEND_IMAGE="srikantheggoju/food-frontend"
        BACKEND_IMAGE="srikantheggoju/food-backend"
        TAG="${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'docker build -t $FRONTEND_IMAGE:$TAG .'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'docker build -t $BACKEND_IMAGE:$TAG .'
                }
            }
        }
    }
}
