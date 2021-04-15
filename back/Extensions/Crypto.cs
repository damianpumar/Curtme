using System;
using System.Security.Cryptography;
using System.Text;

namespace Curtme.Extensions
{
    public static class Crypto
    {
        public static String GetSHA512(this string value)
        {
            using (var algorithm = SHA512.Create())
            {
                var hashedBytes = algorithm.ComputeHash(Encoding.UTF8.GetBytes(value));

                return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
            }
        }
    }
}