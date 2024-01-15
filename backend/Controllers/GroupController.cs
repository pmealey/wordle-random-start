using backend.Data;
using backend.Models;
using backend.Services;
using backend.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.ObjectPool;

namespace backend.Controllers;

[ApiController]
[Route("[controller]")]
public class GroupController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ILogger<GroupController> _logger;
    private readonly IEnumerable<ResultParser> _resultParsers;

    public static List<Group> Groups = new List<Group> 
    {
        new() { Name = "family", SelectGames = true },
        new() { Name = "libo", SelectGames = false }
    };

    public GroupController(DataContext context, ILogger<GroupController> logger, IEnumerable<ResultParser> resultParsers)
    {
        _context = context;
        _logger = logger;
        _resultParsers = resultParsers;
    }

    [HttpGet("{name}")]
    public IActionResult Get(string name)
    {
        var group = Groups.FirstOrDefault(g => g.Name == name);

        if (group == null) {
            return NotFound();
        }

        return Ok(group);
    }
}
