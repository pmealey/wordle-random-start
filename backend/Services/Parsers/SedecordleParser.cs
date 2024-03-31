using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class SedecordleParser : BasicScoreResultParser
    {
        private ILogger<SedecordleParser> _logger;

        public SedecordleParser(ILogger<SedecordleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Sedecordle";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($@"Daily #[^\n]+\n(?<{ScoreGroup}>.*?)\n{ExtraContent}", RegexOptions.Singleline);
        protected override string? ExtraContent => "sedecordle.com\n#sedecordle";
        public override string Url => "https://www.sedecordle.com/?mode=daily";

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            if (dailyResult.Scores == null)
            {
                return null;
            }

            return "\"" + string.Join(",", Enumerable.Range(0, 16).ToArray()
                .Select((i) => {
                    if (dailyResult.Scores.Count <= i)
                    {
                        return "X";
                    }

                    return dailyResult.Scores[i].ToString();
                })) + "\"";
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(ScoreGroup))
            {
                return dailyResult;
            }

            var scoresText = parserResults.Groups[ScoreGroup].Value;

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
            var scores = Regex.Matches(scoresText, @"[\d\uFE0F\u20E3]+")
                .OfType<Match>()
                .Select(match => {
                    var value = match.Value
                        .Replace("\uFE0F", string.Empty)
                        .Replace("\u20E3", string.Empty);
                    return int.Parse(value);
                })
                .ToList();

            dailyResult.Scores = scores;

            return dailyResult;
        }
    }
}
