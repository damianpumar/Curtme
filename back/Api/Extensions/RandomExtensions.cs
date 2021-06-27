using System;
using System.Linq;
using Curtme.Models;

namespace Curtme.Extensions
{
    public static class RandomExtensions
    {
        private static Random random = new Random();

        public static string Create()
        {
            return new string(Enumerable.Repeat(ShortURLConstants.validCharactersShortURL, ShortURLConstants.LengthCreation)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}