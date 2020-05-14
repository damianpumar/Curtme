using System;
using System.Net;
using System.Text.RegularExpressions;
using HtmlAgilityPack;

namespace Curtme.Extensions
{
    public static class TitleExtension
    {
        public static string GetTitle(this string url)
        {
            try
            {
                var webGet = new HtmlWeb();
                var document = webGet.Load(url);
                return document.DocumentNode.SelectSingleNode("html/head/title").InnerText;
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