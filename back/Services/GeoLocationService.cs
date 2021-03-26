using System.Net;
using IPGeolocation;
using Microsoft.Extensions.Configuration;

namespace Curtme.Services
{
    public class GeoLocationService
    {
        private readonly IPGeolocationAPI client;

        public GeoLocationService(IConfiguration configuration)
        {
            this.client = new IPGeolocationAPI(configuration["GeoLocation:Key"]);
        }

        public Geolocation GetData(IPAddress remoteIp)
        {
#if DEBUG
            var ip = "2.155.39.153";
#else
            var ip = remoteIp.ToString();
#endif

            GeolocationParams geoParams = new GeolocationParams();
            geoParams.SetIPAddress(ip);

            return client.GetGeolocation(geoParams);
        }
    }
}