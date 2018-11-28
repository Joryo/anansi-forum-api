![anansi-forum](https://raw.githubusercontent.com/joryo/anansi-forum-api/master/logo.png)

A simple forum API server running on Node.js, [Fortune.js](http://fortune.js.org/) and MongoDB.

* [Features](#features)
* [Installation](#installation)
* [API Documentation](#api-documentation)

## Features
* Login member with Json Web Token
* Members can create post and write comments under it
* Search on post title
* Tags on post for classification

## Installation

### Needs
You just need an empty MongoDb database. You can install it locally or use external solution like [MLab](https://mlab.com/signup/).

### Configuration
Edit the '.env.template' file with your personnal configuration before running the app and rename it '.env'.

**Parameters**

* SUPER_ADMIN: The email of the member who will have all the rights en the API (see authorization on Api documentation).
* DB_HOST: Your MongoDb URI.
* DB_DATABASE: The name of MongoDb database you will store the data.
* JWT_SECRET: A 32 characters length random string for generate Json Web Token.
* SERVER_PORT: The listening port on the server.
* ERROR_LOG_FILE: Filepath to the error log file.
* COMBINED_LOG_FILE: Filepath for all log.
* MAILER_SERVICE: Mailer service (gmail for example). See [Nodemailer supported services](https://nodemailer.com/smtp/well-known/)
* MAILER_ADRESS: Mailer email adress
* MAILER_PASSWORD: Mailer password

### Run the server

Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

1. Clone or Download the repository

  ```
  $ git clone https://github.com/Joryo/anansi-forum-api.git
  $ cd anansi-forum-api
  ```
2. Install Dependencies

  ```
  $ npm install
  ```
2. Edit configuration file ```.env.template``` with your config (see [Configuration](#configuration)) and rename the file to ```.env```

3. Start the application

  ```
  $ npm start
  ```
Your app should now be running on [localhost:3000](http://localhost:3000/).

## API Documentation

The authentification work with [Json Web Token](https://jwt.io/introduction/)<br/>

The API use [JSON API specification](http://jsonapi.org/format/)<br/>
Exemple of url params with JSON API:

* Pagination: <br/>
  ```page[offset]=0&page[limit]=10```

* Include relationships data:
  ```include=author```

* Filter data:
  ```fields[members]=email```

**Authorization:**

* [Login](#login)<br/>

**Member:**

* [Get member](#get-member)<br/>
* [Get members](#get-members)<br/>
* [Create member](#create-member)<br/>
* [Update member](#update-member)<br/>
* [Delete member](#delete-member)<br/>

**Post:**<br/>
* [Get post](#get-post)<br/>
* [Get posts](#get-posts)<br/>
* [Create post](#create-post)<br/>
* [Update post](#update-post)<br/>
* [Delete post](#delete-post)<br/>
* [Search post](#search-post)<br/>

**Comment:**<br/>
* [Get comment](#get-comment)<br/>
* [Get comments](#get-comments)<br/>
* [Create comment](#create-comment)<br/>
* [Update comment](#update-comment)<br/>
* [Delete comment](#delete-comment)<br/>

**Tag:**<br/>
* [Get tag](#get-tag)<br/>
* [Get tags](#get-tags)<br/>
* [Create tag](#create-tag)<br/>
* [Update tag](#update-tag)<br/>
* [Delete tag](#delete-tag)<br/>

**Lost password:**<br/>
* [Lost password](#lost-password)<br/>

**Server status:**<br/>
* [Get server status](#status)<br/>

### Login
----
Get a json web token. This token provide access to API.

* #### URL:
    /auth/

* #### Method:
    `POST`

* #### URL Params:
    None

* #### Data Params:
    ```json
    {
    "email": "John.doe@gmail.com",
    "password" : "test.pass"
  }
  ```

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
    {
        "jsonapi": {
            "version": "1.0"
        },
        "data": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXIiOnsiaWQiOiJ6R2V3UWxaYmIiLCJhdHRyaWJ1dGVzIjp7ImVtYWlsIjoic3VwZXJhZG1pbkBzdXBlcmZvcnVtLmNvbSIsInBzZKVkbyI6InN1cGVyYWRtaW4LLCJyb2xlIjoicmVnaXN0ZXJlZCJ9fSwiaWF0IjoxNTMzNzcwNzE3LCJleHAiOjE1MzYzNjI3MTd9.x-MajWGmB8Tfyfulj1vMiQR2OoEnjKJjSixlRm6OR_o"
        }
    }
      ```

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/members/FCLaha6ki",
    "method": "GET",
    "headers": {
      "Content-Type": "application/vnd.api+json",
      "Authorization": "Bearer {jwtToken}"
    },
    "data": "{\n\t\"email\": \"John.doe@gmail.com\",\n\t\"password\" : \"test.pass\"\n}"
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * guest
  * registered
  * admin

### Get member
----
Returns data about a single member.

* #### URL:
    /members/:id

* #### Method:
    `GET`

* #### URL Params:
    **Required:**<br/>
    `id=[integer]`

* #### Data Params:
    None

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
      {
        "type": "members",
        "id": "FCLaha6ki",
        "attributes": {
          "email": "John.doe@gmail.com",
          "pseudo": "John Doe",
          "role": "registered",
          "date-created": "2018-07-30T16:04:43.006Z"
        },
        "relationships": {
            "posts": {"..."},
            "comments": {"..."}
        }
      }
      ```

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/members/FCLaha6ki",
    "method": "GET",
    "headers": {
      "Content-Type": "application/vnd.api+json",
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered
  * admin

### Get members
----
Returns data about multiple members.

* #### URL:
    /members

* #### Method:
    `GET`

* #### URL Params:
    None

* #### Data Params:
    None

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
      [
        {
          "type": "members",
          "id": "FCLaha6ki",
          "attributes": {
            "email": "John.doe@gmail.com",
            "pseudo": "John Doe",
            "role": "registered",
            "date-created": "2018-07-30T16:04:43.006Z"
          },
          "relationships": {
              "posts": {"..."},
              "comments": {"..."}
          }
        }
     ]
      ```

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/members",
    "method": "GET",
    "headers": {
      "Content-Type": "application/vnd.api+json",
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered
  * admin

### Create member
----
Create a single member.

* #### URL:
    /members

* #### Method:
    `POST`

* #### URL Params:
    None

* #### Data Params:
    **JSONAPI data attributes required:**<br/>
  `email=[string]`<br/>
  `password=[string]`<br/>

    **JSONAPI data attributes optional:**<br/>
  `pseudo=[string]`<br/>

* #### Success Response:
    * **Code:** 201 <br/>
      **JSONAPI data content sample:**
      ```json
      {
        "type": "members",
        "id": "oSXzfJjXr",
        "meta": {
          "token": "{jwtToken}"
        },
        "attributes": {
          "email": "John.doe@gmail.com",
          "pseudo": "John Doe",
          "role": "registered",
          "date-created": "2018-08-06T11:53:56.079Z"
        }
      }
      ```

* #### Error Response:
    * **Code:** 400 BAD REQUEST <br/>
    * **Code:** 401 UNAUTHORIZED <br/>
    * **Code:** 409 CONFLICT <br/>

* #### Sample Call:
    ```js
  $.ajax(
    "url": "/members",
    "method": "POST",
    "headers": {
      "Content-Type": "application/vnd.api+json",
    },
    "data": "{
       \"data\": {
         \"type\": \"member\",
           \"attributes\": {
           \"email\": \"John.doe@gmail.com\",
           \"password\" : \"test.pass\",
           \"pseudo\" : \"John Doe\"
         }
      }
    }"
  ).done(function (response) {
    console.log(response);
  });
  ```
* #### Authorizations:
  * guest without control on role field
  * registered without control on role field
  * admin

* #### Notes:
    * A jwt token is send on meta at creation. It could be use for authentification on the api.

### Update member
----
Update a single member.

* #### URL:
    /members

* #### Method:
    `PATCH`

* #### URL Params:
   **Required:**<br/>
   `id=[integer]`

* #### Data Params:
    **JSONAPI data attributes optional:**<br/>
    `email=[string]`<br/>
    `password=[string]`<br/>
    `pseudo=[string]`<br/>
    `role=[string]`<br/>

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
      {
        "type": "members",
        "id": "oSXzfJjXr",
        "attributes": {
            "email": "John.doe@gmail.com",
            "pseudo": "John Doe",
            "role": "registered",
            "date-created": "2018-08-06T11:53:56.079Z"
        }
      }
      ```

* #### Error Response:
    * **Code:** 400 BAD REQUEST <br/>
    * **Code:** 401 UNAUTHORIZED <br/>
    * **Code:** 409 CONFLICT <br/>

* #### Sample Call:
    ```js
  $.ajax(
    "url": "/members/FCLaha6ki",
    "method": "PATCH",
    "headers": {
      "Content-Type": "application/vnd.api+json",
      "Authorization": "Bearer {jwtToken}"
    },
    "data": "{
      \"data\": {
         \"type\": \"member\",
         \"id\": \"FCLaha6ki\",
         \"attributes\": {
           \"email\": \"John.doe60@gmail.com\",
           \"password\" : \"test.pass\",
           \"pseudo\" : \"John Doe\"
          }
      }
    }"
  ).done(function (response) {
    console.log(response);
  });
  ```
* #### Authorizations:
  * registered on his own member data without control on role field
  * admin

### Delete member
----
Delete a single member.

* #### URL:
    /members/:id

* #### Method:
    `DELETE`

* #### URL Params:
    **Required:**<br/>
    `id=[integer]`

* #### Data Params:
    None

* #### Success Response:
    * **Code:** 204 <br/>

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/members/FCLaha6ki",
    "method": "DELETE",
    "headers": {
      "Content-Type": "application/vnd.api+json",
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered on his own member data
  * admin

### Get post
----
Returns data about a single post.

* #### URL:
    /posts/:id

* #### Method:
    `GET`

* #### URL Params:
    **Required:**<br/>
    `id=[integer]`

* #### Data Params:
    None

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
      {
        "type": "posts",
        "id": "ZLqEOtEryy",
        "attributes": {
            "title": "Post title",
            "text": "Post text",
            "date-created": "2018-07-30T16:04:47.669Z",
            "date-updated": "2018-07-31T16:04:47.669Z"
        },
        "relationships": {
            "author": {"..."},
            "comments": {"..."},
            "tags": {"..."}
        }
      }
      ```

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/posts/VRejKp98V",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered
  * admin

### Get posts
----
Returns data about a multiple post.

* #### URL:
    /posts

* #### Method:
    `GET`

* #### URL Params:
  None

* #### Data Params:
    None

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
      [
        {
          "type": "posts",
          "id": "ZLqEOtEryy",
          "attributes": {
              "title": "Post title",
              "text": "Post text",
              "date-created": "2018-07-30T16:04:47.669Z",
              "date-updated": "2018-07-31T16:04:47.669Z"
          },
          "relationships": {
              "author": {"..."},
              "comments": {"..."},
              "tags": {"..."}
          }
          }
      ]
      ```

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/posts",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered
  * admin


### Create post
----
Create a single post.

* #### URL:
    /posts

* #### Method:
    `POST`

* #### URL Params:
    None

* #### Data Params:
    **JSONAPI data attributes required:**<br/>
  `title=[string]`<br/>
  `text=[string]`<br/>

    **JSONAPI data attributes optional:**<br/>
  `tags=[array<tag id>]`<br/>
  `comments=[array<comment id>]`<br/>

* #### Success Response:
    * **Code:** 201 <br/>
      **JSONAPI data content sample:**
      ```json
      {
        "type": "posts",
        "id": "VRejKp98V",
        "attributes": {
            "title": "Post title",
            "text": "Post text",
            "date-created": "2018-08-07T13:20:35.578Z",
            "date-updated": null
        },
        "relationships": {
          "author" : {"..."},
          "comments" : {"..."},
          "tags" : {"..."}
        }
      }
      ```

* #### Error Response:
    * **Code:** 400 BAD REQUEST <br/>
    * **Code:** 401 UNAUTHORIZED <br/>
    * **Code:** 409 CONFLICT <br/>

* #### Sample Call:
    ```js
  $.ajax(
    "url": "/posts",
    "method": "POST",
    "headers": {
      "Content-Type": "application/vnd.api+json",
      "Authorization": "Bearer {jwtToken}"
    },
    "data": "{
      \"data\": {
        \"type\": \"post\",
        \"attributes\": {
          \"title\": \"Post title\",
          \"text\" : \"Post text\",
          \"tags\" : \"SJSq3ZhZ\"
        }
      }
    }"
  ).done(function (response) {
    console.log(response);
  });
  ```
* #### Authorizations:
  * registered
  * admin

* #### Notes:
    * The author relationship is automatically set with the member id on authorization token

### Update post
----
Update a single post.

* #### URL:
    /posts

* #### Method:
    `PATCH`

* #### URL Params:
    **Required:**<br/>
    `id=[integer]`

* #### Data Params:
   **JSONAPI data attributes optional:**<br/>
   `title=[string]`<br/>
   `text=[string]`<br/>
   `tags=[array<tag ids>]`<br/>

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
      {
        "type": "posts",
        "id": "oSXzfJjXr",
        "attributes": {
            "title": "New post title",
            "text": "New post text",
            "date-created": "2018-08-07T13:20:35.578Z",
            "date-updated": "2018-08-07T21:21:57.383Z"
        },
        "relationships": {
          "author" : {"..."},
          "comments" : {"..."},
          "tags" : {"..."}
        }
      }
      ```

* #### Error Response:
    * **Code:** 400 BAD REQUEST <br/>
    * **Code:** 401 UNAUTHORIZED <br/>
    * **Code:** 409 CONFLICT <br/>

* #### Sample Call:
    ```js
  $.ajax(
    "url": "/posts/FCLaha6ki",
    "method": "PATCH",
    "headers": {
      "Content-Type": "application/vnd.api+json",
      "Authorization": "Bearer {jwtToken}"
    },
    "data": "{
      \"data\": {
        \"type\": \"post\",
        \"id\": \"oSXzfJjXr\",
        \"attributes\": {
          \"title\": \"New post title\",
          \"text\" : \"New post text\",
          \"tags\" : [\"s443e4pGqm\"]
        }
      }
  }"
  ).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered on his own authored post
  * admin

### Delete post
----
Delete a single member.

* #### URL:
    /posts/:id

* #### Method:
    `DELETE`

* #### URL Params:
    **Required:**<br/>
    `id=[integer]`

* #### Data Params;
    None

* #### Success Response:
    * **Code:** 204 <br/>

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/members/FCLaha6ki",
    "method": "DELETE",
    "headers": {
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered on his own authored post
  * admin

### Search post
----
Search and return post by searchinf term in post title.

* #### URL:
    /posts

* #### Method:
    `GET`

* #### URL Params:
    **Required:**<br/>
    `search[title]=[string]`

* #### Data Params:
    None

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
      [
        {
          "type": "posts",
          "id": "ZLqEOtEryy",
          "attributes": {
              "title": "Post title",
              "text": "Post text",
              "date-created": "2018-07-30T16:04:47.669Z",
              "date-updated": "2018-07-31T16:04:47.669Z"
          },
          "relationships": {
              "author": {"..."},
              "comments": {"..."},
              "tags": {"..."}
          }
        }
      ]
      ```

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/posts?search[title]=term",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered
  * admin

### Get comment
----
Returns data about a single comment.

* #### URL:
    /comments/:id

* #### Method:
    `GET`

* #### URL Params:
    **Required:**<br/>
    `id=[integer]`

* #### Data Params:
    None

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
      {
        "type": "comments",
        "id": "a5PCN3ccYU",
        "attributes": {
            "text": "A comment text",
            "date-created": "2018-07-30T16:04:47.750Z"
        },
        "relationships": {
            "post": {"..."},
            "author": {"..."}
        }
      }
      ```

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/comments/a5PCN3ccYU",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered
  * admin

### Get comments
----
Returns data about multiple comments.

* #### URL:
    /comments

* #### Method:
    `GET`

* #### URL Params:
  None

* #### Data Params:
    None

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
      [
        {
          "type": "comments",
          "id": "a5PCN3ccYU",
          "attributes": {
              "text": "A comment text",
              "date-created": "2018-07-30T16:04:47.750Z"
          },
          "relationships": {
              "post": {"..."},
              "author": {"..."}
          }
        }
     ]
      ```

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/comments",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered
  * admin


### Create comment
----
Create a single comment.

* #### URL:
    /tags

* #### Method:
    `POST`

* #### URL Params:
    None

* #### Data Params:
    **JSONAPI data attributes required:**<br/>
   `text=[string]`<br/>

* #### Success Response:
    * **Code:** 201 <br/>
      **JSONAPI data content sample:**
      ```json
      {
        "type": "posts",
        "id": "s443e4pGqm",
        "attributes": {
            "text": "Comment",
            "date-created": "2018-07-30T16:04:47.750Z"
     },
        "relationships": {
            "post": {"..."},
            "author": {"..."}
        }
      }
      ```

* #### Error Response:
    * **Code:** 400 BAD REQUEST <br/>
    * **Code:** 401 UNAUTHORIZED <br/>
    * **Code:** 409 CONFLICT <br/>

* #### Sample Call:
    ```js
  $.ajax(
    "url": "/comments",
    "method": "POST",
    "headers": {
      "Content-Type": "application/vnd.api+json",
      "Authorization": "Bearer {jwtToken}"
    },
    "data": "{
      \"data\": {
        \"type\": \"comment\",
        \"attributes\": {
          \"text\" : \"Comment text\",
        }
      }
    }"
  ).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered
  * admin

### Update comment
----
Update a single comment.

* #### URL:
    /comments

* #### Method:
    `PATCH`

* #### URL Params:
    **Required:**<br/>
    `id=[integer]`

* #### Data Params:
   **JSONAPI data attributes optional:**<br/>
   `text=[string]`<br/>

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
      {
        "type": "posts",
        "id": "s443e4pGqm",
        "attributes": {
            "text": "New comment text",
            "date-created": "2018-07-30T16:04:47.750Z"
     },
        "relationships": {
            "post": {"..."},
            "author": {"..."}
        }
      }
      ```

* #### Error Response:
    * **Code:** 400 BAD REQUEST <br/>
    * **Code:** 401 UNAUTHORIZED <br/>
    * **Code:** 409 CONFLICT <br/>

* #### Sample Call:
    ```js
  $.ajax(
    "url": "/posts/s443e4pGqm",
    "method": "PATCH",
    "headers": {
      "Content-Type": "application/vnd.api+json",
      "Authorization": "Bearer {jwtToken}"
    },
    "data": "{
      \"data\": {
        \"type\": \"post\",
        \"id\": \"s443e4pGqm\",
        \"attributes\": {
          \"text\" : \"New comment text\",
        }
      }
  }"
  ).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered on his own authored comment
  * admin

### Delete comment
----
Delete a single comment.

* #### URL:
    /comments/:id

* #### Method:
    `DELETE`

* #### URL Params:
    **Required:**<br/>
    `id=[integer]`

* #### Data Params;
    None

* #### Success Response:
    * **Code:** 204 <br/>

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/comments/s443e4pGqm",
    "method": "DELETE",
    "headers": {
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered on his own authored comment
  * admin

### Get tag
----
Returns data about a single post.

* #### URL:
    /tags/:id

* #### Method:
    `GET`

* #### URL Params:
    **Required:**<br/>
    `id=[integer]`

* #### Data Params:
    None

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
      {
        "type": "tags",
        "id": "s443e4pGqm",
        "attributes": {
          "text": "tag name",
          "color": "#54110f"
        },
        "relationships": {
            "posts": {"..."}
        }
      }
      ```

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/tags/s443e4pGqm",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered
  * admin

### Get tags
----
Returns data about multiple tags.

* #### URL:
    /tags

* #### Method:
    `GET`

* #### URL Params:
  None

* #### Data Params:
    None

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
      [
        {
          "type": "tags",
          "id": "s443e4pGqm",
          "attributes": {
            "text": "tag name",
            "color": "#54110f"
          },
          "relationships": {
              "posts": {"..."}
          }
        }
      ]
      ```

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/tags",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * registered
  * admin

### Create tag
----
Create a single tag. Only for administrator.

* #### URL:
    /tags

* #### Method:
    `POST`

* #### URL Params:
    None

* #### Data Params:
    **JSONAPI data attributes required:**<br/>
  `text=[string]`<br/>
  `color=[string]`<br/>

* #### Success Response:
    * **Code:** 201 <br/>
      **JSONAPI data content sample:**
      ```json
      {
        "type": "tags",
        "id": "s443e4pGqm",
        "attributes": {
            "text": "Post title",
            "color": "#ffffff"
     },
        "relationships": {
            "posts": {"..."}
        }
      }
      ```

* #### Error Response:
    * **Code:** 400 BAD REQUEST <br/>
    * **Code:** 401 UNAUTHORIZED <br/>
    * **Code:** 409 CONFLICT <br/>

* #### Sample Call:
    ```js
  $.ajax(
    "url": "/tags",
    "method": "POST",
    "headers": {
      "Content-Type": "application/vnd.api+json",
      "Authorization": "Bearer {jwtToken}"
    },
    "data": "{
      \"data\": {
        \"type\": \"tag\",
        \"attributes\": {
          \"text\" : \"Tag text\",
          \"color\" : \"#ffffff\"
        }
      }
    }"
  ).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * admin

### Update tag
----
Update a single tag.

* #### URL:
    /tags

* #### Method:
    `PATCH`

* #### URL Params:
    **Required:**<br/>
    `id=[integer]`

* #### Data Params:
   **JSONAPI data attributes optional:**<br/>
   `text=[string]`<br/>
   `color=[string]`<br/>

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
      {
        "type": "tags",
        "id": "s443e4pGqm",
        "attributes": {
            "text": "New tag text",
            "color": "#ffffff"
     },
        "relationships": {
            "posts": {"..."}
        }
      }
      ```

* #### Error Response:
    * **Code:** 400 BAD REQUEST <br/>
    * **Code:** 401 UNAUTHORIZED <br/>
    * **Code:** 409 CONFLICT <br/>

* #### Sample Call:
    ```js
  $.ajax(
    "url": "/tags/s443e4pGqm",
    "method": "PATCH",
    "headers": {
      "Content-Type": "application/vnd.api+json",
      "Authorization": "Bearer {jwtToken}"
    },
    "data": "{
      \"data\": {
        \"type\": \"post\",
        \"id\": \"oSXzfJjXr\",
        \"attributes\": {
          \"text\" : \"New tag text\",
          \"color\" : [\"#ffffff"]
        }
      }
  }"
  ).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * admin

### Delete tag
----
Delete a single tag.

* #### URL:
    /tags/:id

* #### Method:
    `DELETE`

* #### URL Params:
    **Required:**<br/>
    `id=[integer]`

* #### Data Params;
    None

* #### Success Response:
    * **Code:** 204 <br/>

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/tags/s443e4pGqm",
    "method": "DELETE",
    "headers": {
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * admin

### Lost password
----
Send an email with a JWT token to registered user.
The content of the email depends on the data parameters.
The JWT token will be added at the end of the redirect url.
**The redirect url must begin with 'http(s)://'.**

* #### URL:
    /lostpassword/

* #### Method:
    `POST`

* #### URL Params:
    None

* #### Data Params:
    ```json
    {
        "email": "John.doe@gmail.com",
        "subject": "Lost password",
        "text" : "Follow this url",
        "redirect_url" : "http://www.anansi.com/changepassword/",
        "redirect_label" : "Click here"
    }
   ```

* #### Success Response:
    * **Code:** 204 <br/>

* #### Error Response:
    * **Code:** 404 NOT FOUND <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/lostpassword/",
    "method": "POST",
    "headers": {
      "Content-Type": "application/vnd.api+json"
    },
    "data": "{\n\t\"email\": \"John.doe@gmail.com\",\n\t\"subject\" : \"Lost password\"\n,\n\t\"text\": \"Follow this url\",,\n\t\"redirect_url\": \"http://www.anansi.com/changepassword/\",\n\t\"redirect_label\": \"Click here\"}"
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * guest
  * registered
  * admin

### Status
----
Get the running version af the API and the count of members, posts and comments in database.

* #### URL:
    /status/

* #### Method:
    `GET`

* #### URL Params:
    None

* #### Success Response:
    * **Code:** 200 <br/>
      **JSONAPI data content sample:**
      ```json
        {
            "jsonapi": {
                "version": "1.0"
            },
            "data": {
                "status": {
                    "overall": {
                        "members": 51,
                        "posts": 200,
                        "comments": 19858
                    },
                    "lastWeek": {
                        "members": 51,
                        "posts": 200,
                        "comments": 19858
                    },
                    "version": "0.2"
                }
            }
        }
      ```

* #### Error Response:
    * **Code:** 401 UNAUTHORIZED <br/>

* #### Sample Call:
    ```js
  $.ajax({
    "url": "/status",
    "method": "GET",
    "headers": {
      "Content-Type": "application/vnd.api+json",
      "Authorization": "Bearer {jwtToken}"
    }
  }).done(function (response) {
    console.log(response);
  });
  ```

* #### Authorizations:
  * admin