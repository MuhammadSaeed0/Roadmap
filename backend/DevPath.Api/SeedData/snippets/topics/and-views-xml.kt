class OrdersFragment : Fragment(R.layout.fragment_orders) {
    private var _binding: FragmentOrdersBinding? = null
    private val binding get() = _binding!!
    private val vm: OrdersViewModel by viewModels()
    private val adapter = OrdersAdapter { order -> vm.open(order.id) }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentOrdersBinding.bind(view)
        binding.list.adapter = adapter
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                vm.orders.collect { adapter.submitList(it) }
            }
        }
        binding.summary.setContent { OrderSummary(vm) }      // a ComposeView inside the XML layout
    }

    override fun onDestroyView() { super.onDestroyView(); _binding = null }   // the view dies before the Fragment
}

class OrdersAdapter(private val onClick: (Order) -> Unit) :
    ListAdapter<Order, OrdersAdapter.Holder>(object : DiffUtil.ItemCallback<Order>() {
        override fun areItemsTheSame(a: Order, b: Order) = a.id == b.id
        override fun areContentsTheSame(a: Order, b: Order) = a == b
    }) {
    class Holder(val binding: ItemOrderBinding) : RecyclerView.ViewHolder(binding.root)
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        Holder(ItemOrderBinding.inflate(LayoutInflater.from(parent.context), parent, false))
    override fun onBindViewHolder(holder: Holder, position: Int) {
        val order = getItem(position)
        holder.binding.title.text = "#${order.id}"
        holder.binding.root.setOnClickListener { onClick(order) }
    }
}
