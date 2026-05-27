pipeline {
    agent any

    environment {
        IMAGE_NAME = 'daily-frontend-chat'
        REGISTRY   = 'localhost:5000'
        DEPLOY_DIR = '/opt/daily'
    }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Build') {
            steps {
                sh """
                    docker build \
                      --build-arg NUXT_PUBLIC_API_BASE=http://45.90.216.186:8000/api \
                      -t ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} \
                      -t ${REGISTRY}/${IMAGE_NAME}:latest \
                      .
                """
            }
        }

        stage('Push') {
            steps {
                sh """
                    docker push ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}
                    docker push ${REGISTRY}/${IMAGE_NAME}:latest
                """
            }
            post {
                failure {
                    sh """
                        docker rmi ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} || true
                        docker rmi ${REGISTRY}/${IMAGE_NAME}:latest || true
                    """
                }
            }
        }

        stage('Deploy') {
            when { branch 'main' }
            steps {
                sh """
                    cd ${DEPLOY_DIR}

                    sed -i 's|^FRONTEND_CHAT_IMAGE=.*|FRONTEND_CHAT_IMAGE=${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}|' .env

                    docker compose up -d --no-deps --force-recreate frontend-chat

                    docker compose ps frontend-chat
                """
            }
        }
    }

    post {
        success { echo "✅ Frontend Chat #${BUILD_NUMBER} deployed" }
        failure { echo "❌ Build #${BUILD_NUMBER} failed" }
        always  { sh 'docker image prune -f --filter "until=72h\" || true' }
    }
}
