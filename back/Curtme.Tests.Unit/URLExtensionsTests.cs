using Curtme.Extensions;
using Xunit;

namespace Curtme.Tests.Unit
{
    public class UrlExtensionsTests
    {
        public class Method_GetDomainName_Should
        {
            [Fact]
            public void Get_Unknown_If_Send_Null_As_Argument()
            {
                var domainName = UrlExtensions.GetDomainName(null);

                Assert.Equal(domainName, "Unknown");
            }

            [Fact]
            public void Get_Unknown_If_Send_Invalid_URL()
            {
                var domainName = UrlExtensions.GetDomainName("zzz");

                Assert.Equal(domainName, "Unknown");
            }

            [Fact]
            public void Get_Google_If_The_URL_Is_www_google_com()
            {
                var domainName = UrlExtensions.GetDomainName("https://www.google.com");

                Assert.Equal("Google.com", domainName);
            }

            [Fact]
            public void Get_Google_If_The_URL_Is_www_mail_google_com_ar()
            {
                var domainName = UrlExtensions.GetDomainName("https://www.mail.google.com.ar");

                Assert.Equal("Mail.google.com.ar", domainName);
            }
        }

        public class Method_IsValidURL_Should
        {
            [Fact]
            public void True_if_is_a_valid_url()
            {
                var isValid = UrlExtensions.IsValidURL("https://www.mail.google.com.ar");

                Assert.True(isValid);
            }

            [Fact]
            public void False_if_is_a_not_valid_url()
            {
                var isValid = UrlExtensions.IsValidURL("https://fff");

                Assert.False(isValid);
            }

            [Fact]
            public void False_if_is_a_null()
            {
                var isValid = UrlExtensions.IsValidURL(null);

                Assert.False(isValid);
            }

            [Fact]
            public void False_if_is_an_empty_string()
            {
                var isValid = UrlExtensions.IsValidURL("");

                Assert.False(isValid);
            }
        }
    }
}
