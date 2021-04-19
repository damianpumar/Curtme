using System;
using Curtme.Models;
using MongoDB.Driver;

namespace Curtme.Services
{
    public class UserService
    {
        private readonly MongoDBService mongoDBService;

        public UserService(MongoDBService mongoDBService)
        {
            this.mongoDBService = mongoDBService;
        }

        public User GetUserById(String id)
        {
            return this.mongoDBService.Users.Find<User>(user => user.Id == id).SingleOrDefault();
        }

        public void CreateUser(User userIn)
        {
            this.mongoDBService.Users.InsertOne(userIn);
        }
    }
}