using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class QuordleParser : ResultParser
    {
        private ILogger<QuordleParser> _logger;

        public QuordleParser(ILogger<QuordleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override bool Default => true;
        private List<string> ScoreGroups = new [] { 1, 2, 3, 4 }
            .Select(i => "score" + i.ToString())
            .ToList();

        public override string GameName => "Quordle";
        public override bool GolfScoring => true;
        public override string? HelpText => null;

        protected override Regex Parser => new Regex($"Daily {GameName}[^\\d]+\\d+.*?[\\s\n\r]+{string.Join("[^\\d]*", ScoreGroups.Select(g => $"(?<{g}>[\\d|🟥])"))}");
        public override string Url => "https://www.merriam-webster.com/games/quordle/";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace("m-w.com/games/quordle/", string.Empty).Trim();
        }

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            if (dailyResult.Scores == null)
            {
                return null;
            }

            return "\"" + string.Join(",", Enumerable.Range(0, 4).ToArray()
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
            var scores = ScoreGroups
                .Where(g => parserResults.Groups.ContainsKey(g))
                .Select(g => parserResults.Groups[g].Value)
                .Select(v => int.TryParse(v, out var score) ? (int?)score : null)
                .Where(v => v.HasValue)
                .Select(v => v!.Value)
                .ToList();

            dailyResult.Scores = scores;

            return dailyResult;
        }
    }
}
