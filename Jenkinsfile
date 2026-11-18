pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "srikantheggoju/food-frontend"
        BACKEND_IMAGE  = "srikantheggoju/food-backend"

        TAG = "${BUILD_NUMBER}"

        GITOPS_REPO = "https://github.com/YOUR_GITHUB_USERNAME/food-ordering-gitops.git"
    }

    stages {

        stage('Checkout Source') {
            steps {
                checkout scm
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
                        credentialsId: 'gitops-creds',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_PASS'
                    )
                ]) {

                    sh '''
                    rm -rf gitops

                    git clone https://$GIT_USER:$GIT_PASS@github.com/YOUR_GITHUB_USERNAME/food-ordering-gitops.git gitops
                    '''
                }
            }
        }

        stage('Update Helm Values') {
            steps {
                sh '''
                sed -i "s/tag:.*/tag: $TAG/" gitops/helm-chart/values.yaml
                '''
            }
        }

        stage('Commit and Push Changes') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'gitops-creds',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_PASS'
                    )
                ]) {

                    sh '''
                    cd gitops

                    git config user.email "jenkins@local.com"
                    git config user.name "Jenkins"

                    git add .

                    git commit -m "Updated image tag to $TAG" || true

                    git push https://$GIT_USER:$GIT_PASS@github.com/YOUR_GITHUB_USERNAME/food-ordering-gitops.git main
                    '''
                }
            }
        }
    }
}
