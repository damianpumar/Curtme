using System;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Curtme.Models
{
    public class Link
    {
        public Link(String sourceURL, String shortURL, String title, String userId = null)
        {
            this.SourceURL = sourceURL;
            this.ShortURL = shortURL;
            this.Date = DateTime.UtcNow;
            this.Title = title;
            this.UserId = userId;
            this.Visibility = Visibility.Private;
        }

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public String Id { get; set; }

        [JsonIgnore]
        public String UserId { get; set; }

        public String SourceURL { get; set; }

        public String ShortURL { get; set; }

        public String Title { get; set; }

        public DateTime Date { get; set; }

        public Int32 Visited { get; set; }

        [JsonIgnore]
        public Boolean Deleted { get; set; }

        [JsonIgnore]
        public String Password { get; set; }

        public Boolean HasPassword
        {
            get
            {
                return !String.IsNullOrEmpty(this.Password);
            }
        }

        [JsonIgnore]
        public Visibility Visibility { get; private set; }

        public Boolean IsPublic
        {
            get
            {
                return this.Visibility == Visibility.Public;
            }
        }

        public void ToggleVisibility()
        {
            this.Visibility = this.IsPublic ? Visibility.Private : Visibility.Public;
        }
    }

    public enum Visibility
    {
        Private,
        Public
    }
}