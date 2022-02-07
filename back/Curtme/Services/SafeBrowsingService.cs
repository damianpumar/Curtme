using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace Curtme.Services
{
    public class SafeBrowsingService
    {
        private readonly string SafeBrowsingURL;

        public SafeBrowsingService(IConfiguration configuration)
        {
            var safeBrowsingKey = configuration["SafeBrowsing:Key"];

            this.SafeBrowsingURL = $"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={safeBrowsingKey}";
        }

        public async Task<bool> IsSafeUrl(string url)
        {
            var request = SafeBrowsingRequest.Create(new string[] { url });
            var content = request.ToJson();

            using (var client = new HttpClient())
            {
                try
                {
                    var response = await client.PostAsync(this.SafeBrowsingURL, content);

                    var resultContent = await response.Content.ReadAsStringAsync();

                    return !resultContent.Contains(url);
                }
                catch (Exception)
                {
                    return true;
                }
            }
        }
    }

    public class SafeBrowsingRequest
    {
        private SafeBrowsingRequest(string[] urls)
        {
            this.Client = new SafeBrowsingClientRequest();
            this.ThreatInfo = new ThreatInfoRequest(urls);
        }

        public static SafeBrowsingRequest Create(string[] urls)
        {
            return new SafeBrowsingRequest(urls);
        }

        [JsonProperty("client")]
        public SafeBrowsingClientRequest Client { get; }

        [JsonProperty("threatInfo")]
        public ThreatInfoRequest ThreatInfo { get; }

        public StringContent ToJson()
        {
            return new StringContent(JsonConvert.SerializeObject(this), Encoding.Default, "application/json");
        }
    }

    public class ThreatInfoRequest
    {
        public ThreatInfoRequest(string[] urls)
        {
            this.ThreatEntries = urls.Select(url => new UrlRequest(url)).ToArray();
        }

        [JsonProperty("threatTypes")]
        public string[] ThreatTypes => new string[] { "MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION" };

        [JsonProperty("platformTypes")]
        public string[] PlatformTypes => new string[] { "ANY_PLATFORM" };

        [JsonProperty("threatEntryTypes")]
        public string[] ThreatEntryTypes => new string[] { "URL" };

        [JsonProperty("threatEntries")]
        public UrlRequest[] ThreatEntries { get; }
    }

    public class UrlRequest
    {
        public UrlRequest(string url)
        {
            this.Url = url;
        }

        [JsonProperty("url")]
        public string Url { get; }
    }

    public class SafeBrowsingClientRequest
    {
        [JsonProperty("clientId")]
        public string ClientId => "Curtme.org";

        [JsonProperty("clientVersion")]
        public string ClientVersion => "1.0.0";
    }
}