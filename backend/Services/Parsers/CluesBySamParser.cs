using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class CluesBySamParser : ResultParser
    {
        private ILogger<CluesBySamParser> _logger;

        public CluesBySamParser(ILogger<CluesBySamParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Clues by Sam";
        public override bool GolfScoring => true;
        public override string? HelpText => "Fewer mistakes/hints/clues is better than a faster time";
        private const string TimeGroup = "time";
        protected override Regex Parser => new Regex($"I solved the daily Clues by Sam\\(.*?\\)in (?<{TimeGroup}>.*)");
        public override string Url => "https://cluesbysam.com";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result;
        }

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            return dailyResult.Score?.ToString() + " - " + dailyResult.Time?.ToString();
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(TimeGroup))
            {
                return dailyResult;
            }

            var timeString = parserResults.Groups[TimeGroup].Value;

            if (timeString.StartsWith("less than"))
            {
                timeString = timeString
                    .Replace("less than ", "")
                    .Replace("minutes", "")
                    .Trim();

                if (int.TryParse(timeString, out var minutes))
                {
                    dailyResult.Time = new TimeSpan(0, minutes, 0);
                }
            }
            else
            {
                var time = ParseTimeSpanString(timeString);
                if (time != null)
                {
                    dailyResult.Time = time;
                }
            }

            dailyResult.Score = new Regex("🟩", RegexOptions.Multiline).Count(dailyResult.Result);

            return dailyResult;
        }

        private TimeSpan? ParseTimeSpanString(string timeSpan)
        {
            timeSpan = timeSpan.Replace('.', ':');

            _logger.LogDebug($"Parsing {timeSpan}...");
            var timeDelimiters = timeSpan.ToCharArray().Count(c => c == ':');

            if (TimeSpan.TryParseExact(timeSpan, "m\\:ss", null, System.Globalization.TimeSpanStyles.None, out var time))
            {
                _logger.LogDebug($"Was able to parse the time.");
                return time;
            }

            _logger.LogDebug($"Was unable to parse the time.");
            return null;
        }
    }
}
