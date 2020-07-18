using System;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Curtme.Models
{
    public class Link
    {
        public Link(String longURL, String shortURL, String title, String userId = null)
        {
            this.LongURL = longURL;
            this.ShortURL = shortURL;
            this.Date = DateTime.UtcNow;
            this.Title = title;
            this.UserId = userId;
        }

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public String Id { get; set; }

        [JsonIgnore]
        public String UserId { get; set; }

        public String LongURL { get; set; }

        public String ShortURL { get; set; }

        public String Title { get; set; }

        public DateTime Date { get; set; }

        public Int32 Visited { get; set; }
    }
}