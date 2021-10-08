namespace Curtme.Models
{
    public static class Constants
    {
        public const string NOT_FOUND_LINK_ERROR = "Link does not exist.";
        public const string NO_BODY_ERROR = "You must send http body, please check our documentation www.curtme.org/developer";
        public const string INVALID_URL_ERROR = "Invalid URL.";
        public const string SOURCE_URL_IS_ALREADY_SHORTENED_URL = "The source URL is already a shortened url.";
        public const string SHORT_URL_REQUIRED_ERROR = "shortURL is required";
        public const string LINK_ID_REQUIRED_ERROR = "linkId is required";
        public const string NOT_FOUND_LINK_DETAILS_ERROR = "This link has not visited yet.";
        public const string LINK_ALREADY_EXIST = "already exists, please take other custom short url";
        public const string PASSWORD_MISSMATCH = "Password missmatch.";
        public readonly static string SHORT_URL_INVALID = $"must have only alphanumeric characters, and has a length between {ShortUrlConstants.LengthUpdateMin} and {ShortUrlConstants.LengthUpdateMax}.";
    }
}