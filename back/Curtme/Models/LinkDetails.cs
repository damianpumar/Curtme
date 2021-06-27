using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Curtme.Models
{
    public class LinkDetails
    {
        public LinkDetails(Link link)
        {
            this.LinkId = link.Id;
        }

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public String Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public String LinkId { get; set; }

        public String Language { get; set; }

        public String Ip { get; set; }

        public String ISP { get; set; }

        public String ContinentName { get; set; }

        public String CountryCode { get; set; }

        public String CountryName { get; set; }

        public String ZipCode { get; set; }

        public String City { get; set; }

        public Double Latitude { get; set; }

        public Double Longitude { get; set; }

        public String CountryEmoji { get; set; }

        public DateTime Date { get; set; }

        public String Host { get; set; }

        public String Platform { get; set; }

        public String PlatformVersion { get; set; }

        public String Browser { get; set; }

        public String BrowserVersion { get; set; }

        public String Device { get; set; }

        public String Engine { get; set; }
    }
}
