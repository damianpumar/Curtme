using System;
using HtmlAgilityPack;

namespace Curtme.Extensions
{
    public static class TitleExtension
    {
        public static String GetTitle(this String url)
        {
            try
            {
                var webGet = new HtmlWeb();

                var document = webGet.Load(url);

                return document.DocumentNode.SelectSingleNode("html/head/title").InnerText;
            }
            catch (Exception)
            {
                Uri.TryCreate(url, UriKind.Absolute, out var uriResult);

                return uriResult.Host;
            }
        }
    }
}