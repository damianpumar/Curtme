namespace Curtme.Models
{
    public static class Constants
    {
        public const string NOT_FOUND_LINK_ERROR = "Link does not exist";
        public const string NO_BODY_ERROR = "You must send http body, please check our documentation";
        public const string INVALID_URL_ERROR = "Invalid URL";
        public const string SHORT_URL_REQUIRED_ERROR = "shortURL is required";
        public const string NEW_SHORT_URL_OR_SOURCE_URL_REQUIRED_ERROR = "newShortURL is required or sourceURL is required";
        public const string LINK_ID_REQUIRED_ERROR = "linkId is required";
        public const string NOT_FOUND_LINK_DETAILS_ERROR = "This link has not visited yet.";
        public const string LINK_ALREADY_EXIST = "already exists, please take other custom short url";
    }
}