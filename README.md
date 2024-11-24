# User Service API

A serverless REST API for managing user data, built with Express.js and deployed on AWS Lambda using the Serverless Framework.

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
```

## User Object Format

A user object has the following structure:

```typescript
{
  id: string;          // UUID format
  firstName: string;   // Non-empty string
  lastName: string;    // Non-empty string
  emails: string[];    // Array of 1-3 unique valid email addresses
  dob: string;        // ISO date format (YYYY-MM-DD)
}
```

### Validation Rules
- `id` must be a valid UUID
- `firstName` and `lastName` cannot be empty strings
- `emails` array must contain between 1 and 3 unique email addresses
- Email addresses must be in valid format
- `dob` must be in YYYY-MM-DD format
- No additional fields are allowed in the object

## API Endpoints

### GET /users/{id}
Retrieves a user by ID.

#### Success Response (200)
```json
{
  "status": "success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "firstName": "John",
    "lastName": "Doe",
    "emails": ["john.doe@example.com"],
    "dob": "1990-01-01"
  }
}
```

#### Error Response (404)
```json
{
  "status": "error",
  "message": "User not found"
}
```

### POST /users
Creates a new user.

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "emails": ["john.doe@example.com"],
  "dob": "1990-01-01"
}
```

#### Success Response (201)
```json
{
  "status": "success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "firstName": "John",
    "lastName": "Doe",
    "emails": ["john.doe@example.com"],
    "dob": "1990-01-01"
  }
}
```

#### Error Response (400)
Example of the error response for an invalid email address:
```json
{
  "status": "error",
  "message": "Invalid payload",
  "errors": [
    {
      "validation": "email",
      "code": "invalid_string",
      "message": "Invalid email format",
      "path": ["emails",0]
    }
  ]
}
```

Example of the error response for a missing field:
```json
{
  "status": "error",
  "message": "Invalid payload",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": [
          "firstName"
      ],
      "message": "First name is required"
    }
  ]
}
```

### PUT /users/{id}
Updates an existing user.

#### Email Address updates:
Email addresses can only be added, not removed or updated.
A user can have between 1 and 3 email addresses.

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "emails": ["john.doe@example.com", "john.d@company.com"],
  "dob": "1990-01-01"
}
```

#### Success Response (200)
```json
{
  "status": "success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "firstName": "John",
    "lastName": "Doe",
    "emails": ["john.doe@example.com", "john.d@company.com"],
    "dob": "1990-01-01"
  }
}
```


#### Error Responses
- 400: Invalid payload
Example of the error response for a missing field:
```json
{
  "status": "error",
  "message": "Invalid payload",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": [
          "firstName"
      ],
      "message": "First name is required"
    }
  ]
}
```

Example of an error response when attempting to removing an email address:
```json
{
  "status": "error",
  "message": "Deleting an email is not allowed"
}
```
- 404: User not found
```json
{
  "status": "error",
  "message": "User not found"
}
```

### DELETE /users/{id}
Deletes a user.

#### Success Response (204)
No content in the response body.

## Running Tests

The project uses Jest for testing. To run the tests:

```bash
# Run tests
yarn test
```

## Deployment

### Prerequisites
1. AWS Account
2. AWS CLI installed and configured

### Deploy to AWS

1. Configure AWS credentials:
```bash
aws configure
```

2. Deploy to a specific stage:
```bash
# Deploy to dev environment
yarn run deploy --stage dev

# Or deploy to production
yarn run deploy --stage prod
```

The deployment will create:
- API Gateway endpoints
- Lambda functions
- DynamoDB table
- Required IAM roles and policies

After successful deployment, the Serverless Framework will output the API endpoint URLs.

### Local Development

To run the service locally:
```bash
yarn run dev
```

This will start a local server that simulates the AWS Lambda environment.

## Environment Variables

- `USERS_TABLE`: DynamoDB table name (automatically set during deployment)


