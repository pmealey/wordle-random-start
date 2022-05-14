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

        private const string TimePart1 = "time1";
        private const string TimePart2 = "time2";
        private const string _gameName = "Crosswordle 1";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"Daily Crosswordle \\d+: (?<{TimeGroup}>(?<{TimePart1}>\\d+)[ms] ?(?<{TimePart2}>\\d*)s?)");
        protected override Regex Parser => _parser;
        private const string _url = "https://crosswordle.vercel.app/";
        public override string Url => _url;

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace(_url + "?daily=1", string.Empty).Replace("\n\n", "\n").Trim();
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
