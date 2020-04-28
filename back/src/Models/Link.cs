using System;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Curtme.Models
{
    public class Link
    {
        public Link(string longURL)
        {
            this.LongURL = longURL;
            this.Date = DateTime.Now;
        }

        [JsonIgnore]
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public String Id { get; set; }

        public String LongURL { get; set; }

        public String ShortURL { get; set; }

        public DateTime Date { get; set; }

        public Int32 Visited { get; set; }
    }
}