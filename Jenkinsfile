pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = 'gustave-dockerhub-credentials'
        DOCKERHUB_USERNAME    = 'gustavedev'
        IMAGE_NAME            = "${DOCKERHUB_USERNAME}/tasklist-frontend"
        IMAGE_TAG             = "${BUILD_NUMBER}"
        SONAR_SERVER          = 'sonarqube-server-1'
        SONAR_TOKEN_ID        = 'gustave-sonar-token'
    }
    stages {
        stage('Install Dependencies') {
            steps { sh 'npm ci' }
        }
        stage('Unit Tests') {
            steps { sh 'npm run test:coverage' }
            post {
                always {
                    junit 'reports/junit.xml'
                    archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
                }
            }
        }
        stage('Build') {
            steps { sh 'npm run build' }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv(credentialsId: "${SONAR_TOKEN_ID}", installationName: "${SONAR_SERVER}") {
                    sh '''
                        docker run --rm \
                            --volumes-from $(hostname) \
                            --user $(id -u):$(id -g) \
                            -w $(pwd) \
                            -e SONAR_HOST_URL=$SONAR_HOST_URL \
                            -e SONAR_TOKEN=${SONAR_TOKEN:-$SONAR_AUTH_TOKEN} \
                            -e HOME=/tmp \
                            sonarsource/sonar-scanner-cli \
                            -Dsonar.working.directory=.scannerwork
                    '''
                }
            }
        }
        stage('Quality Gate') {
            steps {
                script {
                    try {
                        timeout(time: 3, unit: 'MINUTES') { waitForQualityGate abortPipeline: false }
                    } catch (err) {
                        echo "Quality Gate non confirmé, on continue : ${err}"
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps { sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ." }
        }
        stage('Trivy Scan') {
            steps { sh "trivy image --timeout 15m --severity HIGH,CRITICAL --exit-code 1 --format table ${IMAGE_NAME}:${IMAGE_TAG}" }
        }
        stage('Generate SBOM (SPDX)') {
            steps { sh "trivy image --timeout 15m --format spdx-json --output sbom-spdx.json ${IMAGE_NAME}:${IMAGE_TAG}" }
            post { always { archiveArtifacts artifacts: 'sbom-spdx.json', allowEmptyArchive: true } }
        }
        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push ${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${IMAGE_NAME}:latest
                        docker logout
                    '''
                }
            }
        }
    }
    post { always { sh 'docker system prune -f || true' } }
}