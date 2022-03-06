namespace backend.Utilities
{
    public static class TimeUtility
    {
        public static DateTime GetNowEasternStandardTime()
        {
            return TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time"));
        }
    }
}