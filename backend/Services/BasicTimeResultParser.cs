using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services
{
    public abstract class BasicTimeResultParser : ResultParser
    {
        private ILogger<BasicTimeResultParser> _logger;

        public BasicTimeResultParser(ILogger<BasicTimeResultParser> logger) : base(logger)
        {
            _logger = logger;
        }

        protected const string TimeGroup = "time";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(TimeGroup))
            {
                return GameName;
            }

            var time = ParseTimeSpanString(parserResults.Groups[TimeGroup].Value);

            if (time == null)
            {
                return GameName;
            }

            var formatted = string.Format("{0}{1}{2}{3}",
                time.Value.Duration().Days > 0 ? string.Format("{0:0} day{1}, ", time.Value.Days, time.Value.Days == 1 ? string.Empty : "s") : string.Empty,
                time.Value.Duration().Hours > 0 ? string.Format("{0:0} hour{1}, ", time.Value.Hours, time.Value.Hours == 1 ? string.Empty : "s") : string.Empty,
                time.Value.Duration().Minutes > 0 ? string.Format("{0:0} minute{1}, ", time.Value.Minutes, time.Value.Minutes == 1 ? string.Empty : "s") : string.Empty,
                time.Value.Duration().Seconds > 0 ? string.Format("{0:0} second{1}", time.Value.Seconds, time.Value.Seconds == 1 ? string.Empty : "s") : string.Empty);

            return GameName + "\n" + formatted;
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(TimeGroup))
            {
                return dailyResult;
            }

            var time = ParseTimeSpanString(parserResults.Groups[TimeGroup].Value);
            if (time == null)
            {
                return dailyResult;
            }

            dailyResult.Time = time;

            return dailyResult;
        }

        private TimeSpan? ParseTimeSpanString(string timeSpan)
        {
            _logger.LogDebug($"Parsing {timeSpan}...");
            var timeDelimiters = timeSpan.ToCharArray().Count(c => c == ':');

            _logger.LogDebug($"{timeDelimiters} : characters found found...");
            var timeFormat = timeDelimiters == 2
                ? "h\\:mm\\:ss"
                : timeDelimiters == 1
                    ? "m\\:ss"
                    : "ss";

            _logger.LogDebug($"Formatting with {timeFormat}...");

            if (TimeSpan.TryParseExact(timeSpan, timeFormat, null, System.Globalization.TimeSpanStyles.None, out var time))
            {
                _logger.LogDebug($"Was able to parse the time.");
                return time;
            }

            _logger.LogDebug($"Was unable to parse the time.");
            return null;
        }
    }
}
