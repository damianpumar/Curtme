using System;
using System.Linq;

namespace Curtme.Extensions
{
    public static class RandomExtensions
    {
        private static Random random = new Random();
        public static string Create(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}