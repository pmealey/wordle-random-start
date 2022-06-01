using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class Crosswordle1Parser : BasicTimeResultParser
    {
        private ILogger<Crosswordle1Parser> _logger;

        public Crosswordle1Parser(ILogger<Crosswordle1Parser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override DateTime ActiveAfter => DateTime.MinValue;
        public override string Category => "Word";
        private const string TimePart1 = "time1";
        private const string TimePart2 = "time2";
        public override string GameName => "Crosswordle 1";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"Daily Crosswordle \\d+: (?<{TimeGroup}>(?<{TimePart1}>\\d+)[ms] ?(?<{TimePart2}>\\d*)s?)");
        public override string Url => "https://crosswordle.vercel.app/";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace(Url + "?daily=1", string.Empty).Replace("\n\n", "\n").Trim();
        }

        protected override TimeSpan? ParseTimeSpanString(Match parserResults)
        {
            var timeSpan = parserResults.Groups[TimeGroup].Value;
            var timePart1 = parserResults.Groups[TimePart1].Value;
            var timePart2 = parserResults.Groups[TimePart2].Value;

            _logger.LogDebug($"Parsing {timeSpan}...");

            if (timeSpan.Contains("m") && Int32.TryParse(timePart1, out var minutes) && Int32.TryParse(timePart2, out var seconds))
            {
                return new TimeSpan(0, minutes, seconds);
            }
            else if (Int32.TryParse(timePart2, out seconds))
            {
                return new TimeSpan(0, 0, seconds);
            }

            return null;
        }
    }
}
