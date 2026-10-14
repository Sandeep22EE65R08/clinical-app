using System.Linq.Expressions;
using ClinicApp.Api.Data;
using ClinicApp.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Repositories;

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    private readonly ApplicationDbContext _db;
    private readonly DbSet<T> _set;

    public Repository(ApplicationDbContext db)
    {
        _db = db;
        _set = db.Set<T>();
    }

    public IQueryable<T> Query() => _set.AsQueryable();

    public Task<T?> GetByIdAsync(Guid id) => _set.FirstOrDefaultAsync(e => e.Id == id);

    public Task<List<T>> ListAsync(Expression<Func<T, bool>> predicate) => _set.Where(predicate).ToListAsync();

    public async Task AddAsync(T entity) => await _set.AddAsync(entity);

    public void Update(T entity) => _set.Update(entity);

    public void Remove(T entity) => _set.Remove(entity);

    public Task<int> SaveChangesAsync() => _db.SaveChangesAsync();
}
