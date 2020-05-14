using System;
using System.Net;
using System.Text.RegularExpressions;

namespace Curtme.Extensions
{
    public static class TitleExtension
    {
        public static string GetTitle(this string url)
        {
            try
            {
                WebClient x = new WebClient();
                string source = x.DownloadString(url);

                return Regex.Match(source, @"\<title\b[^>]*\>\s*(?<Title>[\s\S]*?)\</title\>",
                    RegexOptions.IgnoreCase).Groups["Title"].Value;
            }
            catch (Exception)
            {
                if (Uri.TryCreate(url, UriKind.Absolute, out var uriResult))
                    return uriResult.Host;

                return url;
            }
        }
    }
}