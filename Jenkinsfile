pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "srikantheggoju/food-frontend"
        BACKEND_IMAGE = "srikantheggoju/food-backend"
        TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'

                    withSonarQubeEnv('sonarqube') {

                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=food-ordering \
                        -Dsonar.projectName=food-ordering \
                        -Dsonar.sources=.
                        """

                    }
                }
            }
        }

        stage('Trivy Filesystem Scan') {
            steps {
                sh 'trivy fs .'
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh 'docker build -t $FRONTEND_IMAGE:$TAG .'
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t $BACKEND_IMAGE:$TAG .'
                }
            }
        }

        stage('Trivy Frontend Image Scan') {
            steps {
                sh 'trivy image $FRONTEND_IMAGE:$TAG'
            }
        }

        stage('Trivy Backend Image Scan') {
            steps {
                sh 'trivy image $BACKEND_IMAGE:$TAG'
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                 
