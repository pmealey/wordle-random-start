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

        private const int _priority = 4;
        public override int Priority => _priority;
        private List<string> ScoreGroups = new [] { 1, 2, 3, 4 }
            .Select(i => "score" + i.ToString())
            .ToList();

        private const string _gameName = "Quordle";
        public override string GameName => _gameName;
        protected override Regex Parser => new Regex($"Daily {_gameName} #\\d+[\\s\n\r]+{string.Join("[^\\d]*", ScoreGroups.Select(g => $"(?<{g}>[\\d|🟥])"))}");

        protected override string GetCleanResult(string result, Match parserResults)
        {
            var quordleUrlIndex = result.IndexOf("quordle.com");
            return quordleUrlIndex > -1 ? result.Substring(0, quordleUrlIndex).Trim() : result.Trim();
        }

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            return dailyResult.Scores == null || dailyResult.Scores.Count != 4 ? null : dailyResult.Scores.Average().ToString();
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
