# Translation Service

## Responsibilities

#### Form Schema Data Resolution

When a form is requested by a client, this service will loaded the form schema from the form engine and perform data enrichment. Once enriched the schema will be sent to the caller.

A form schema may have default values with Json Path expression returned from the form engine

```$json

{
  components: [
    {
      type: 'textfield',
      key: 'firstName',
      label: 'First Name',
      input: true,
      defaultValue: '$.keycloakContext.givenName'
    },
    {
      type: 'textfield',
      key: 'lastName',
      label: 'Last Name',
      defaultValue: '$.keycloakContext.familyName'
      input: true
    },
    {
      type: 'button',
      action: 'submit',
      label: 'Submit',
      theme: 'primary'
    }
  ]
}


```

Using the logged in user's credentials the service will create a data context which will be used to resolve the json path expressions. Data resolvers will consist of:

1. Keycloak
2. User and Staff Attributes
3. Teams
4. Reference data
5. Environment contexts (URL resolutions)


**_All endpoints are protected using Keycloak_**

The following environment variables are required:

1. AUTH_CLIENT_ID
2. AUTH_URL
3. AUTH_REALM
4. SESSION_SECRET
