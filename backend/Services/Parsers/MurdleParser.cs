using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class MurdleParser : BasicTimeResultParser
    {
        private ILogger<MurdleParser> _logger;

        public MurdleParser(ILogger<MurdleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Murdle";
        public override bool GolfScoring => true;
        public override string? HelpText => null;
        private const string ScoreGroup = "score";
        // 0\uFE0F\u20E3 = 0️⃣
        // 1\uFE0F\u20E3 = 1️⃣
        // 2\uFE0F\u20E3 = 2️⃣
        // 3\uFE0F\u20E3 = 3️⃣
        // 4\uFE0F\u20E3 = 4️⃣
        // 5\uFE0F\u20E3 = 5️⃣
        // 6\uFE0F\u20E3 = 6️⃣
        // 7\uFE0F\u20E3 = 7️⃣
        // 8\uFE0F\u20E3 = 8️⃣
        // 9\uFE0F\u20E3 = 9️⃣
        protected override Regex Parser => new Regex($@"{GameName} for [\d/]+[^✅❌]+(?<{ScoreGroup}>[✅❌]+)\s+(?<{TimeGroup}>[:0123456789\uFE0F\u20E3]+)", RegexOptions.Singleline);
        public override string Url => "https://murdle.com/";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            var streakEmojisStart = result.IndexOf("⚖️");
            return result[..streakEmojisStart].Trim();
        }

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            return dailyResult.Score?.ToString() + " - " + base.GetScoreValue(dailyResult);
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (parserResults.Groups.ContainsKey(ScoreGroup))
            {
                // main murdle score is the number of failures - fewer failures = better score
                dailyResult.Score = parserResults.Groups[ScoreGroup].Value.Split('❌').Length - 1;
            }

            if (parserResults.Groups.ContainsKey(TimeGroup))
            {
                // secondary murdle score is the time it took - less time elapsed = better score
                var timeSpan = parserResults.Groups[TimeGroup].Value
                    .Replace("\uFE0F", string.Empty)
                    .Replace("\u20E3", string.Empty);

                var time = ParseTimeSpanString(timeSpan, parserResults);
                if (time != null)
                {
                    dailyResult.Time = time;
                }
            }

            // overall score is the fewest failures with the best time
            return dailyResult;
        }
    }
}
