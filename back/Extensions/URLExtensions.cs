using System;

namespace Curtme.Extensions
{
    public static class URLExtensions
    {
        public static Boolean IsValidURL(this String url)
        {
            return !String.IsNullOrEmpty(url)
                    &&
                    Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
                    &&
                    !uriResult.IsLoopback;
        }

        public static Boolean IsValidWebSite(this String url)
        {
            return IsValidURL(url)
                    &&
                    Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
                    &&
                   (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps)
                    &&
                    uriResult.HostNameType == UriHostNameType.Dns;
        }
    }
}