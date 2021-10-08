namespace Curtme.Models
{
    public static class ShortUrlConstants
    {
        public readonly static int LengthCreation = 7;

        public readonly static int LengthUpdateMin = ShortUrlConstants.LengthCreation;

        public readonly static int LengthUpdateMax = 10;

        public readonly static string ValidCharactersShortURL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    }
}