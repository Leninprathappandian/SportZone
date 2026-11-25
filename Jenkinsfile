
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
    AWS_REGION = 'ap-southeast-2'
    AWS_ACCOUNT_ID = '428819150292'

    FRONTEND_REPO = 'sportzone-frontend'
    BACKEND_REPO  = 'sportzone-backend'

    ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

    AWS_CREDENTIALS = 'aws-ecr-credentials-new'

    DEPLOY_DIR = '/opt/sportzone'
}

    stages {

        // STAGE 1: Checkout
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Leninprathappandian/SportZone.git'
            }
        }

        // STAGE 2: Build Docker images
        stage('Build Frontend and Backend') {
            steps {
                script {
                    sh '''
                        docker build \
                          -t ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER} \
                          ./frontend

                        docker build \
                          -t ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER} \
                          ./backend

                        docker tag \
                          ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER} \
                          ${ECR_REGISTRY}/${FRONTEND_REPO}:latest

                        docker tag \
                          ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER} \
                          ${ECR_REGISTRY}/${BACKEND_REPO}:latest
                    '''
                }
            }
        }

        // STAGE 3: Login and push to ECR
        stage('Push Images to ECR') {
    steps {
        withCredentials([
            [$class: 'AmazonWebServicesCredentialsBinding',
             credentialsId: "${AWS_CREDENTIALS}"]
        ]) {
            sh '''
                set -e

                # STEP 1: Check AWS identity
                echo "Checking AWS identity..."

                aws sts get-caller-identity

                # STEP 2: Check ECR repositories
                echo "Checking ECR repositories..."

                aws ecr describe-repositories \
                  --region ${AWS_REGION} \
                  --repository-names ${FRONTEND_REPO} ${BACKEND_REPO}

                # STEP 3: Login to ECR
                echo "Logging into ECR..."

                aws ecr get-login-password \
                  --region ${AWS_REGION} |
                docker login \
                  --username AWS \
                  --password-stdin ${ECR_REGISTRY}

                # STEP 4: Push frontend image
                docker push \
                  ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}

                docker push \
                  ${ECR_REGISTRY}/${FRONTEND_REPO}:latest

                # STEP 5: Push backend image
                docker push \
                  ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}

                docker push \
                  ${ECR_REGISTRY}/${BACKEND_REPO}:latest

                docker logout ${ECR_REGISTRY}
            '''
        }
    }
}

        stage('Copy Deployment Files') {
    steps {
        sh '''
            set -e

            test -f docker-compose.yml
            test -f database/init.sql
            test -f ${DEPLOY_DIR}/.env

            mkdir -p ${DEPLOY_DIR}/database

            cp docker-compose.yml ${DEPLOY_DIR}/
            cp database/init.sql ${DEPLOY_DIR}/database/

            echo "Deployment files copied."
        '''
    }
}

stage('Pull and Deploy from ECR') {
    steps {
        sh '''
            set -e

            echo "Checking AWS identity..."
            aws sts get-caller-identity

            echo "Logging into ECR..."
            aws ecr get-login-password --region ${AWS_REGION} |
                docker login --username AWS --password-stdin ${ECR_REGISTRY}

            cd ${DEPLOY_DIR}

            export ECR_REGISTRY=${ECR_REGISTRY}
            export IMAGE_TAG=${BUILD_NUMBER}

            echo "Pulling images from ECR..."
            docker compose pull

            echo "Deploying containers..."
            docker compose up -d --remove-orphans

            echo "Deployment status:"
            docker compose ps

            docker logout ${ECR_REGISTRY}

            echo "SportZone deployment completed."
        '''
    }
}
    }

    post {
        success {
            echo 'SportZone deployment completed successfully!'
        }

        failure {
            echo 'SportZone deployment failed. Check the Jenkins console output.'
        }

        always {
            echo 'SportZone pipeline execution finished.'
        }
    }
}
