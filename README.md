# Setting up Registry Admission Controller

**Make sure you are using the current context for your Kubernetes cluster.**

## Create certificate authority and certificates on the cluster

```bash 
./create-cert.sh

creating certs in certs/
Generating RSA private key, 2048 bit long modulus
.........+++
..........................................+++
e is 65537 (0x10001)
certificatesigningrequest.certificates.k8s.io/registry-admission-service.default created
NAME                                 AGE   REQUESTOR      CONDITION
registry-admission-service.default   0s    masterclient   Pending
certificatesigningrequest.certificates.k8s.io/registry-admission-service.default approved
secret/registry-admission-certs created
```

## Inject CA bundle
This will inject the Certificate Authority bundle (Base64 encoded) into the Admission Controller definition.

```
./inject_ca_bundle.sh

LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUV5RENDQXJDZ0F3SUJBZ0lSQU5NYVBSRDMrdVlwN2RpTVZ5SGxVQjB3RFFZSktvWklodmNOQVFFTEJRQXcKRFRFTE1Ba0dBMVVFQXhNQ1kyRXdIaGNOTVRrd016STRNVFV5T1RFMVdoY05NakV3TXpJM01UVXlPVEUxV2pBTgpNUXN3Q1FZRFZRUURFd0pqWVRDQ0FpSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdn-{snip}-1anNwZVU5dkNkcFcwemc9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==
```

**NOTE**: This will automatically edit the *controller.yaml* definition.

## Create Controller Service

```kubectl
kubectl apply -f controller_svc.yaml
```


## Configure the Admission Controller


```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: registry-admission
  labels:
    app: registry-admission
spec:
  template:
    metadata:
      labels:
        app: registry-admission
    spec:
      containers:
      - name: registry-admission
        image: "inklin/controller:latest"
        env:
        - name: CONTAINER_REGISTRY
          value: "inklin"
        ports:
        - name: admission-port
          containerPort: 3000
```

Within the controller definition, set the prefix for the container registry (e.g. myregistry.azurecr.io), this will be the only allowed registry to use.

### Deploy the controller
```
kubectl -f controller.yaml
```

## Test a normal deployment

```
cd tests
kubectl apply -f invalid.yml
```

Check that the dployment is succesful, and then remove it...

```
kubectl delete -f invalid.yml
```

## Deploy the Webhook

The webhook is the definition within the API server to hand off requests to the controller deployed earlier.

```
kubectl apply -f denyreg-admission-webhook.yaml
```

### Retest the deployment

```
kubectl apply -f invalid.yml
```
