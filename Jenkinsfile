pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "srikantheggoju/food-frontend"
        BACKEND_IMAGE  = "srikantheggoju/food-backend"
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

                    withSonarQubeEnv('sonar-server') {

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
                sh '''
                trivy fs .
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh '''
                    docker build -t $FRONTEND_IMAGE:$TAG .
                    '''
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh '''
                    docker build -t $BACKEND_IMAGE:$TAG .
                    '''
                }
            }
        }

        stage('Trivy Frontend Image Scan') {
            steps {
                sh '''
                trivy image $FRONTEND_IMAGE:$TAG
                '''
            }
        }

        stage('Trivy Backend Image Scan') {
            steps {
                sh '''
                trivy image $BACKEND_IMAGE:$TAG
                '''
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
                    '''
                }
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh '''
                docker push $FRONTEND_IMAGE:$TAG
                '''
            }
        }

        stage('Push Backend Image') {
            steps {
                sh '''
                docker push $BACKEND_IMAGE:$TAG
                '''
            }
        }

        stage('Clone GitOps Repository') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'gittoken',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_PASS'
                    )
                ]) {
                    sh '''
                    rm -rf gitops

                    git clone https://$GIT_USER:$GIT_PASS@github.com/Srikantheggoju/food-gitops.git gitops
                    '''
                }
            }
        }

        stage('Update Helm Values') {
            steps {
                sh '''
                sed -i "s/tag:.*/tag: $TAG/g" gitops/helm-chart/values.yaml
                '''
            }
        }

        stage('Commit and Push Changes') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'gittoken',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_PASS'
                    )
                ]) {
                    sh '''
                    cd gitops

                    git config user.email "jenkins@local.com"
                    git config user.name "Jenkins"

                    git add .

                    git commit -m "Updated image tags to build $TAG" || true

                    git push https://$GIT_USER:$GIT_PASS@github.com/Srikantheggoju/food-gitops.git main
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'DevSecOps GitOps Pipeline Completed Successfully'
        }

        failure {
            echo 'Pipeline Failed'
        }
    }
}
