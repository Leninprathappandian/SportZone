
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        AWS_REGION = 'ap-southeast-2b'

        // Replace with your AWS account ID
        AWS_ACCOUNT_ID = '74e82458-d0e1-70ce-ed3c-24d61c33f357'

        FRONTEND_REPO = 'sportzone-frontend'
        BACKEND_REPO  = 'sportzone-backend'

        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        // Jenkins credentials IDs
        AWS_CREDENTIALS = 'aws-ecr-credentials'
        EC2_SSH_CREDENTIALS = 'ec2-ssh-key'

        // Your EC2 public IP or public DNS
        EC2_HOST = '3.25.122.242'
        EC2_USER = 'ubuntu'

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

                        aws ecr get-login-password \
                          --region ${AWS_REGION} |
                        docker login \
                          --username AWS \
                          --password-stdin ${ECR_REGISTRY}

                        docker push \
                          ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}

                        docker push \
                          ${ECR_REGISTRY}/${FRONTEND_REPO}:latest

                        docker push \
                          ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}

                        docker push \
                          ${ECR_REGISTRY}/${BACKEND_REPO}:latest

                        docker logout ${ECR_REGISTRY}
                    '''
                }
            }
        }

        // STAGE 4: Copy deployment files to EC2
        stage('Copy Files to EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${EC2_SSH_CREDENTIALS}",
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
                        ssh -i "$SSH_KEY" \
                          -o StrictHostKeyChecking=accept-new \
                          ${SSH_USER}@${EC2_HOST} \
                          "sudo mkdir -p ${DEPLOY_DIR}/database &&
                           sudo chown -R ${SSH_USER}:${SSH_USER} ${DEPLOY_DIR}"

                        scp -i "$SSH_KEY" \
                          -o StrictHostKeyChecking=accept-new \
                          docker-compose.yml \
                          ${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/

                        scp -i "$SSH_KEY" \
                          -o StrictHostKeyChecking=accept-new \
                          database/init.sql \
                          ${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/database/
                    '''
                }
            }
        }
       stage('Pull Images and Deploy') {
    steps {
        sshagent(credentials: ["${EC2_SSH_CREDENTIALS}"]) {
            sh """
                ssh -o StrictHostKeyChecking=accept-new ubuntu@${EC2_HOST} '
                    aws ecr get-login-password --region ${AWS_REGION} |
                    sudo docker login --username AWS --password-stdin ${ECR_REGISTRY}

                    cd ${DEPLOY_DIR}

                    sudo env ECR_REGISTRY=${ECR_REGISTRY} IMAGE_TAG=${BUILD_NUMBER} \
                    docker compose pull

                    sudo env ECR_REGISTRY=${ECR_REGISTRY} IMAGE_TAG=${BUILD_NUMBER} \
                    docker compose up -d --remove-orphans
                '
            """
        }
    }
}
        // STAGE 5: Deploy on EC2
        stage('Deploy to EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${EC2_SSH_CREDENTIALS}",
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
                        ssh -i "$SSH_KEY" \
                          -o StrictHostKeyChecking=accept-new \
                          ${SSH_USER}@${EC2_HOST} \
                          "cd ${DEPLOY_DIR} &&
                           aws ecr get-login-password --region ${AWS_REGION} |
                           sudo docker login --username AWS --password-stdin ${ECR_REGISTRY} &&
                           sudo env ECR_REGISTRY=${ECR_REGISTRY} IMAGE_TAG=${BUILD_NUMBER} docker compose pull &&
                           sudo env ECR_REGISTRY=${ECR_REGISTRY} IMAGE_TAG=${BUILD_NUMBER} docker compose up -d --remove-orphans"
                    '''
                }
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
